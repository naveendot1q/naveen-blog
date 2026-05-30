import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/components/MarkdownRenderer'

async function getPost(slug: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return data
  } catch {
    return null
  }
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <div className="min-h-screen pt-20">
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-12"
        >
          <ArrowLeft size={13} /> all posts
        </Link>

        {/* Post header */}
        <header className="mb-12">
          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="mono text-[10px] px-2.5 py-1 rounded-full border border-[var(--accent)] border-opacity-30 text-[var(--accent)] bg-[var(--accent)] bg-opacity-5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-xs text-[var(--muted)] mono">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {estimateReadTime(post.content)} min read
            </span>
          </div>

          {post.excerpt && (
            <p className="mt-6 text-[var(--muted)] text-base leading-relaxed border-l-2 border-[var(--accent)] pl-4 italic">
              {post.excerpt}
            </p>
          )}
        </header>

        <hr className="border-[var(--border)] mb-12" />

        {/* Content */}
        <MarkdownRenderer content={post.content} />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft size={13} /> back to blog
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.png" alt="Naveen Meel" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text)]">Naveen Meel</p>
              <p className="mono text-[10px] text-[var(--muted)]">Cloud & DevOps Engineer</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
