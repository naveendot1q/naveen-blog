import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import { extractHeadings } from '@/lib/slugifyHeading'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return (data as Post) ?? null
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

  const headings = extractHeadings(post.content)

  return (
    <div className="min-h-screen pt-20">
      {/* Fixed TOC — rendered outside the article flow, always in the same spot */}
      <TableOfContents headings={headings} />

      {/*
        Article container: on xl screens we add right padding (pr-72) to keep
        the article text from sliding under the fixed TOC panel.
        On smaller screens the TOC is hidden so no padding needed.
      */}
      <div className="max-w-3xl mx-auto px-6 py-16 xl:pr-80">
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-10 font-medium">
          <ArrowLeft size={13} /> All posts
        </Link>

        <article>
          <header className="mb-12">
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-5 text-xs text-[var(--muted)] mono">
              <span className="flex items-center gap-1.5">
                <Calendar size={11} />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={11} />
                {estimateReadTime(post.content)} min read
              </span>
            </div>
            {post.excerpt && (
              <p className="mt-5 text-[var(--muted)] text-base leading-relaxed border-l-2 border-[var(--accent)] pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          <hr className="border-[var(--border)] mb-12" />

          <MarkdownRenderer content={post.content} />

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-[var(--border)] flex items-center justify-between">
            <Link href="/blog"
              className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium">
              <ArrowLeft size={13} /> Back to blog
            </Link>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.png" alt="Naveen Meel"
                className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" />
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">Naveen Meel</p>
                <p className="mono text-[10px] text-[var(--muted)]">Cloud & DevOps Engineer</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
