import Link from 'next/link'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getRecentPosts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
    return data || []
  } catch {
    return []
  }
}

export default async function BlogPreview() {
  const posts = await getRecentPosts()

  return (
    <section id="blog" className="py-24 px-6 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">
              05 / blog
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">
              Latest Posts
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 mono text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            view all <ArrowRight size={13} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border border-[var(--border)] rounded-xl">
            <p className="mono text-xs text-[var(--muted)] mb-2">$ ls posts/</p>
            <p className="text-[var(--muted)] text-sm">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post: {
              id: string
              title: string
              slug: string
              excerpt: string
              tags: string[]
              created_at: string
            }) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] hover:border-opacity-40 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mono mb-3">
                  <Calendar size={11} />
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm mb-2 group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed flex-1 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag: string) => (
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

        <div className="mt-8 flex sm:hidden">
          <Link
            href="/blog"
            className="flex items-center gap-2 mono text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            view all posts <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
