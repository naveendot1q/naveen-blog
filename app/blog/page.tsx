import Link from 'next/link'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getPosts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8"
          >
            <ArrowLeft size={13} /> back home
          </Link>
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">
            ~/blog
          </p>
          <h1 className="text-4xl font-bold text-[var(--text)] mb-3">Writing</h1>
          <p className="text-[var(--muted)] text-sm">
            Thoughts on cloud infrastructure, DevOps, networking, and the occasional rabbit hole.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-24 border border-[var(--border)] rounded-xl">
            <p className="mono text-sm text-[var(--muted)] mb-2">$ ls posts/</p>
            <p className="text-[var(--muted)] text-sm opacity-60">total 0</p>
            <p className="text-[var(--muted)] text-xs mt-4 opacity-50">Posts are on their way.</p>
          </div>
        ) : (
          <div className="space-y-px border border-[var(--border)] rounded-xl overflow-hidden">
            {posts.map((post: {
              id: string
              title: string
              slug: string
              excerpt: string
              tags: string[]
              created_at: string
            }, index: number) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-[var(--surface)] hover:bg-[var(--bg)] transition-colors duration-200 ${
                  index !== posts.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                <div className="mono text-xs text-[var(--muted)] shrink-0 w-24">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors mb-1">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {post.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="mono text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
