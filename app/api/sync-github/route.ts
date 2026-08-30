import { NextRequest, NextResponse } from 'next/server'
import { listRepoFiles, getFileContent, getFileDates } from '@/lib/github'
import { parsePostFile, findLocalImageRefs, resolveRepoPath, rewriteImageRefs } from '@/lib/post-frontmatter'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorMessage } from '@/lib/error-message'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // no-ops on plans that don't allow raising it — see setup notes

function contentTypeFor(path: string) {
  const ext = (path.split('.').pop() || '').toLowerCase()
  const map: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' }
  return map[ext] || 'application/octet-stream'
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const force = req.nextUrl.searchParams.get('force') === 'true'
  const sb = createAdminClient()
  const results: { commit: string; created: string[]; updated: string[]; skipped: string[]; errors: string[] } = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown (not running on Vercel, or var unset)',
    created: [], updated: [], skipped: [], errors: [],
  }

  let allFiles
  try {
    allFiles = await listRepoFiles()
  } catch (err) {
    return NextResponse.json({ error: `Could not list repo files: ${errorMessage(err)}` }, { status: 500 })
  }
  const allRepoPaths = allFiles.map(f => f.path)
  const files = allFiles.filter(f => /\.mdx?$/i.test(f.path))

  for (const file of files) {
    try {
      const { data: existing } = await sb
        .from('blog_posts')
        .select('id, source_sha, updated_at, synced_at')
        .eq('source_path', file.path)
        .maybeSingle()

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
          const storagePath = `${parsed.slug}/${repoImgPath.split('/').pop()}`
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
