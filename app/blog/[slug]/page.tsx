import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import { extractHeadings } from '@/lib/slugifyHeading'
import ReadingTracker from '@/components/ReadingTracker'

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

async function getRelatedPosts(tags: string[]): Promise<Post[]> {
  if (!tags || tags.length === 0) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at')
      .eq('published', true)
    if (!data) return []
    const related = (data as Post[]).filter((p) =>
      p.tags && p.tags.some((t) => tags.includes(t))
    )
    return related.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      return cmp !== 0 ? cmp : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
  } catch {
    return []
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

  // Prev / Next — sorted A→Z by title
  const relatedAll = await getRelatedPosts(post.tags || [])
  const currentIndex = relatedAll.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? relatedAll[currentIndex - 1] : null
  const nextPost = currentIndex !== -1 && currentIndex < relatedAll.length - 1
    ? relatedAll[currentIndex + 1] : null

  return (
    <div className="min-h-screen pt-20">
      {/*
        Full-width page wrapper — no max-w here, that's set on the inner flex row.
        The flex row is: [TOC 20%] [Article 80%], TOC on the LEFT.
        On screens < xl the TOC hides and the article takes full width.
      */}
      <div className="w-full px-6 py-16">

        {/* Back link — above the flex row, full width */}
        <div className="max-w-screen-2xl mx-auto mb-10">
          <Link href="/blog"
            className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium">
            <ArrowLeft size={13} /> All posts
          </Link>
        </div>

        {/* ── Two-column layout ── */}
        <div className="max-w-screen-2xl mx-auto flex gap-10 items-start">

          {/* LEFT: TOC — 20% on xl+, hidden below xl */}
          <TableOfContents headings={headings} />

          {/* RIGHT: Article — takes remaining ~78% */}
          <article id="blog-article" className="flex-1 min-w-0 max-w-4xl">
            <ReadingTracker postSlug={post.slug} />

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

            {/* Author + back */}
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

            {/* ── Prev / Next navigation — sorted A→Z ── */}
            {(prevPost || nextPost) && (
              <div className="mt-10 grid sm:grid-cols-2 gap-4">
                {/* Previous */}
                <div>
                  {prevPost ? (
                    <Link href={`/blog/${prevPost.slug}`}
                      className="group flex flex-col gap-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:border-opacity-50 transition-all duration-200 h-full">
                      <div className="flex items-center gap-1.5 text-[10px] mono text-[var(--muted)] uppercase tracking-widest">
                        <ArrowLeft size={10} /> Previous
                      </div>
                      <p className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                        {prevPost.title}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-auto pt-1">
                        {prevPost.tags?.slice(0, 2).map((t) => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>
                    </Link>
                  ) : (
                    <div className="p-5 rounded-2xl border border-[var(--border)] border-dashed h-full flex items-center justify-center min-h-[80px]">
                      <p className="text-xs text-[var(--muted)] opacity-40">First post</p>
                    </div>
                  )}
                </div>

                {/* Next */}
                <div>
                  {nextPost ? (
                    <Link href={`/blog/${nextPost.slug}`}
                      className="group flex flex-col gap-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:border-opacity-50 transition-all duration-200 h-full sm:items-end sm:text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] mono text-[var(--muted)] uppercase tracking-widest">
                        Next <ArrowRight size={10} />
                      </div>
                      <p className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                        {nextPost.title}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-end mt-auto pt-1">
                        {nextPost.tags?.slice(0, 2).map((t) => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>
                    </Link>
                  ) : (
                    <div className="p-5 rounded-2xl border border-[var(--border)] border-dashed h-full flex items-center justify-center min-h-[80px]">
                      <p className="text-xs text-[var(--muted)] opacity-40">Latest post</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </article>
        </div>
      </div>
    </div>
  )
}
