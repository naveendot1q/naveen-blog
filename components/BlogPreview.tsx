import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
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
    <section id="blog" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">05 / blog</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Latest Posts</h2>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border border-[var(--border)] rounded-2xl">
            <p className="text-[var(--muted)] text-sm">No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {posts.map((post: { id: string; title: string; slug: string; excerpt: string; tags: string[]; created_at: string }) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:border-opacity-50 transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mono mb-3">
                  <Calendar size={11} />
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm mb-2 group-hover:text-[var(--accent)] transition-colors leading-snug flex-1">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 flex sm:hidden">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-[var(--accent)] font-medium">
            View all posts <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
