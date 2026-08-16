import { NextRequest, NextResponse } from 'next/server'
import { listRepoFiles, getFileContent, getFileDates } from '@/lib/github'
import { parsePostFile, findLocalImageRefs, resolveRepoPath, rewriteImageRefs } from '@/lib/post-frontmatter'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const sb = createAdminClient()
  const results: { created: string[]; updated: string[]; skipped: string[]; errors: string[] } = {
    created: [], updated: [], skipped: [], errors: [],
  }

  let files
  try {
    files = (await listRepoFiles()).filter(f => /\.mdx?$/i.test(f.path))
  } catch (err) {
    return NextResponse.json({ error: `Could not list repo files: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }

  for (const file of files) {
    try {
      const { data: existing } = await sb
        .from('blog_posts')
        .select('id, source_sha, updated_at')
        .eq('source_path', file.path)
        .maybeSingle()

      // Already in sync — nothing changed in the repo since last run
      if (existing && existing.source_sha === file.sha) {
        results.skipped.push(file.path)
        continue
      }

      const { content: rawBuf } = await getFileContent(file.path)
      const parsed = parsePostFile(file.path, rawBuf.toString('utf-8'))
      const { createdAt, updatedAt } = await getFileDates(file.path)

      // If the row was edited in the admin panel more recently than
      // this file's last commit, don't let a stale repo version
      // clobber it — the admin-panel save is responsible for pushing
      // its own changes back to GitHub (see /api/push-to-github).
      if (existing?.updated_at && new Date(existing.updated_at) > new Date(updatedAt)) {
        results.skipped.push(`${file.path} (newer admin edit — left alone)`)
        continue
      }

      // Re-host any repo-relative images to Supabase Storage
      const localRefs = findLocalImageRefs(parsed.body)
      const urlMap = new Map<string, string>()
      for (const ref of localRefs) {
        const repoImgPath = resolveRepoPath(file.path, ref)
        try {
          const { content: imgBuf } = await getFileContent(repoImgPath)
          const storagePath = `${parsed.slug}/${repoImgPath.split('/').pop()}`
          const { error: upErr } = await sb.storage.from('blog-images').upload(storagePath, imgBuf, {
            contentType: contentTypeFor(repoImgPath),
            upsert: true,
          })
          if (upErr) throw upErr
          const { data: pub } = sb.storage.from('blog-images').getPublicUrl(storagePath)
          urlMap.set(ref, pub.publicUrl)
        } catch (imgErr) {
          results.errors.push(`image ${repoImgPath}: ${imgErr instanceof Error ? imgErr.message : String(imgErr)}`)
        }
      }
      const finalBody = urlMap.size > 0 ? rewriteImageRefs(parsed.body, urlMap) : parsed.body

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
      results.errors.push(`${file.path}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json(results)
}
