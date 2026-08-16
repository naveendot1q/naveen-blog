import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFileContent, upsertFile } from '@/lib/github'
import { serializePost } from '@/lib/post-frontmatter'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Only the signed-in admin can push a post to the repo
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com'
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let postId: string
  try {
    const body = await req.json()
    postId = body.postId
    if (!postId) throw new Error()
  } catch {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: post, error: fetchErr } = await admin.from('blog_posts').select('*').eq('id', postId).single()
  if (fetchErr || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const path: string = post.source_path || `posts/${post.slug}.md`
  const fileContent = serializePost(post)

  try {
    let sha: string | undefined = post.source_sha || undefined
    // No known sha yet (post was created in the admin panel, never
    // synced before) — check whether a file already happens to exist
    // at the target path so this doesn't fail as a false conflict.
    if (!sha) {
      try {
        sha = (await getFileContent(path)).sha
      } catch {
        // nothing there — upsertFile will create it fresh
      }
    }

    const { sha: newSha } = await upsertFile(
      path,
      fileContent,
      `${post.source_path ? 'Update' : 'Add'} post: ${post.title}`,
      sha
    )

    await admin.from('blog_posts').update({
      source_path: path,
      source_sha: newSha,
      synced_at: new Date().toISOString(),
    }).eq('id', postId)

    return NextResponse.json({ ok: true, path })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Push to GitHub failed' }, { status: 500 })
  }
}
