import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import RelatedPosts from '@/components/RelatedPosts'
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

async function getRelatedPosts(tags: string[]): Promise<Post[]> {
  if (!tags || tags.length === 0) return []
  try {
    const supabase = await createClient()
    // Fetch all published posts — we filter by tag overlap in JS
    // (avoids relying on .overlaps() which may not be available in all client versions)
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, created_at')
      .eq('published', true)
    if (!data) return []
    // Filter to posts that share at least one tag
    const related = (data as Post[]).filter((p) =>
      p.tags && p.tags.some((t) => tags.includes(t))
    )
    // Sort A → Z by title, then by date as tiebreak
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
  const relatedAll = await getRelatedPosts(post.tags || [])

  const currentIndex = relatedAll.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? relatedAll[currentIndex - 1] : null
  const nextPost = currentIndex !== -1 && currentIndex < relatedAll.length - 1
    ? relatedAll[currentIndex + 1]
    : null

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-10 font-medium">
          <ArrowLeft size={13} /> All posts
        </Link>

        <div className="flex gap-16 items-start">
          {/* ── Main article ── */}
          <article className="flex-1 min-w-0">
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

            <RelatedPosts
              currentSlug={post.slug}
              currentTags={post.tags || []}
              relatedPosts={relatedAll}
              nextPost={nextPost}
              prevPost={prevPost}
            />
          </article>

          {/* ── Sticky TOC sidebar ── */}
          <TableOfContents headings={headings} />
        </div>
      </div>
    </div>
  )
}
