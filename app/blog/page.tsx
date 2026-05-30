import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BlogListClient from './BlogListClient'

async function getPosts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  // Build activity map for heatmap (keyed by YYYY-MM-DD)
  const activityMap: Record<string, number> = {}
  posts.forEach((p: { created_at: string; updated_at?: string }) => {
    const d = p.created_at.slice(0, 10)
    activityMap[d] = (activityMap[d] || 0) + 1
    if (p.updated_at && p.updated_at !== p.created_at) {
      const u = p.updated_at.slice(0, 10)
      activityMap[u] = (activityMap[u] || 0) + 0.5
    }
  })

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8 font-medium">
            <ArrowLeft size={13} /> Back home
          </Link>
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-2">~/blog</p>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">Writing</h1>
          <p className="text-[var(--muted)] text-sm">
            Thoughts on cloud infrastructure, networking, DevOps, and the occasional rabbit hole.
          </p>
        </div>

        <BlogListClient posts={posts} activityMap={activityMap} />
      </div>
    </div>
  )
}
