import { NextRequest, NextResponse } from 'next/server'
import { listRepoFiles, getFileContent, getFileDates } from '@/lib/github'
import { parsePostFile, findLocalImageRefs, resolveRepoPath, rewriteImageRefs } from '@/lib/post-frontmatter'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorMessage } from '@/lib/error-message'
import { sanitizeFilename } from '@/lib/storage-path'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // no-ops on plans that don't allow raising it — see setup notes

function contentTypeFor(path: string) {
  const ext = (path.split('.').pop() || '').toLowerCase()
  const map: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' }
  return map[ext] || 'application/octet-stream'
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  // Conservative even for Hobby's hard 10s cap — leaves headroom for
  // the initial repo-listing call and network jitter. On a full
  // force=true resync of many files, this means it'll take several
  // calls to get through everything: each call does as much as it
  // safely can, then stops and reports what's left, rather than
  // risking a mid-flight FUNCTION_INVOCATION_TIMEOUT that returns
  // nothing at all. Files already processed are cheap to re-check
  // (skipped immediately by the SHA/force logic below) so re-running
  // this repeatedly is safe and just picks up where it left off.
  const TIME_BUDGET_MS = 8_000

  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const force = req.nextUrl.searchParams.get('force') === 'true'
  const sb = createAdminClient()
  const results: { commit: string; force: boolean; incomplete: boolean; remaining: number; created: string[]; updated: string[]; skipped: string[]; errors: string[] } = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown (not running on Vercel, or var unset)',
    force,
    incomplete: false,
    remaining: 0,
    created: [], updated: [], skipped: [], errors: [],
  }

  let allFiles
  try {
    allFiles = await listRepoFiles()
  } catch (err) {
    return NextResponse.json({ error: `Could not list repo files: ${errorMessage(err)}` }, { status: 500 })
  }
  const allRepoPaths = allFiles.map(f => f.path)
  const mdFiles = allFiles.filter(f => /\.mdx?$/i.test(f.path))

  const { data: existingRows } = await sb
    .from('blog_posts')
    .select('id, source_path, source_sha, updated_at, synced_at')
    .in('source_path', mdFiles.map(f => f.path))

  const existingByPath = new Map((existingRows || []).map(r => [r.source_path as string, r]))

  // Never-synced files first, then oldest synced_at first — so a file
  // this run just touched sorts to the back for the NEXT run instead
  // of being picked again immediately.
  const files = [...mdFiles].sort((a, b) => {
    const aSynced = existingByPath.get(a.path)?.synced_at
    const bSynced = existingByPath.get(b.path)?.synced_at
    if (!aSynced && !bSynced) return 0
    if (!aSynced) return -1
    if (!bSynced) return 1
    return new Date(aSynced).getTime() - new Date(bSynced).getTime()
  })

  for (let i = 0; i < files.length; i++) {
    if (Date.now() - startTime > TIME_BUDGET_MS) {
      results.incomplete = true
      results.remaining = files.length - i
      break
    }
    const file = files[i]
    try {
      const existing = existingByPath.get(file.path)

      // Already in sync — nothing changed in the repo since last run.
      // force=true bypasses this specifically (e.g. after a parser fix,
      // to reprocess content that hasn't changed on GitHub's side but
      // needs to be re-parsed with the corrected logic).
      if (!force && existing && existing.source_sha === file.sha) {
        results.skipped.push(`${file.path} (already up to date)`)
        continue
      }

      const { content: rawBuf } = await getFileContent(file.path)
      const parsed = parsePostFile(file.path, rawBuf.toString('utf-8'))
      const { createdAt, updatedAt } = await getFileDates(file.path)

      // If this row was modified meaningfully after the last time sync
      // touched it, treat that as a possible not-yet-pushed admin edit
      // and don't let a stale GitHub pull clobber it. This compares
      // against our OWN synced_at, not GitHub's commit date — comparing
      // against GitHub's date breaks permanently on any table where
      // updated_at gets auto-touched to "now" on every write (a common
      // Postgres/Supabase default), since that makes this check look
      // tripped forever after the very first sync ever touches a row.
      // The 10s buffer absorbs ordinary clock/latency noise between
      // when synced_at is set here and when Postgres actually writes
      // updated_at, so it only fires on a real, meaningful gap.
      const editedSinceLastSync = existing?.updated_at && existing?.synced_at &&
        new Date(existing.updated_at).getTime() - new Date(existing.synced_at).getTime() > 10_000

      if (!force && editedSinceLastSync) {
        results.skipped.push(`${file.path} (edited since last sync — left alone)`)
        continue
      }

      // Re-host any repo-relative images to Supabase Storage — handles
      // both standard Markdown images and Obsidian's ![[..]] embeds
      const localRefs = findLocalImageRefs(parsed.body)
      const urlMap = new Map<string, string>()
      for (const ref of localRefs) {
        const repoImgPath = resolveRepoPath(file.path, ref.src, allRepoPaths)
        try {
          const { content: imgBuf } = await getFileContent(repoImgPath)
          const storagePath = `${parsed.slug}/${sanitizeFilename(repoImgPath.split('/').pop() || 'image')}`
          const { error: upErr } = await sb.storage.from('blog-images').upload(storagePath, imgBuf, {
            contentType: contentTypeFor(repoImgPath),
            upsert: true,
          })
          if (upErr) throw upErr
          const { data: pub } = sb.storage.from('blog-images').getPublicUrl(storagePath)
          urlMap.set(ref.src, pub.publicUrl)
        } catch (imgErr) {
          results.errors.push(`image ${repoImgPath} (referenced as "${ref.src}"): ${imgErr instanceof Error ? imgErr.message : String(imgErr)}`)
        }
      }
      const finalBody = urlMap.size > 0 ? rewriteImageRefs(parsed.body, localRefs, urlMap) : parsed.body

      const basePayload = {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        content: finalBody,
        tags: parsed.tags,
        published: parsed.published,
        source_path: file.path,
        source_sha: file.sha,
        synced_at: new Date().toISOString(),
        updated_at: parsed.date || updatedAt,
      }

      if (existing) {
        const { error: updErr } = await sb.from('blog_posts').update(basePayload).eq('id', existing.id)
        if (updErr) throw updErr
        results.updated.push(file.path)
      } else {
        const { error: insErr } = await sb.from('blog_posts').insert({ ...basePayload, created_at: parsed.date || createdAt })
        if (insErr) throw insErr
        results.created.push(file.path)
      }
    } catch (err) {
      results.errors.push(`${file.path}: ${errorMessage(err)}`)
    }
  }

  return NextResponse.json(results)
}
