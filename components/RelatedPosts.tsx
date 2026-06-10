'use client'

import Link from 'next/link'
import { ArrowRight, ArrowLeft, Tag } from 'lucide-react'
import { Calendar } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  created_at: string
}

interface Props {
  currentSlug: string
  currentTags: string[]
  relatedPosts: Post[]   // all published posts with at least one matching tag, sorted A→Z by title
  nextPost: Post | null  // next post after current in that sorted list
  prevPost: Post | null  // previous post before current in that sorted list
}

export default function RelatedPosts({ currentSlug, currentTags, relatedPosts, nextPost, prevPost }: Props) {
  // Filter out the current post from the related list
  const others = relatedPosts.filter((p) => p.slug !== currentSlug)

  return (
    <div className="mt-16 space-y-10">
      {/* ── Next / Prev navigation ── */}
      {(prevPost || nextPost) && (
        <div className="grid sm:grid-cols-2 gap-4">
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
                <div className="flex flex-wrap gap-1 mt-auto">
                  {prevPost.tags.slice(0, 2).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl border border-[var(--border)] border-dashed h-full flex items-center justify-center">
                <p className="text-xs text-[var(--muted)] opacity-40">First post</p>
              </div>
            )}
          </div>

          {/* Next */}
          <div>
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`}
                className="group flex flex-col gap-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:border-opacity-50 transition-all duration-200 h-full text-right sm:items-end">
                <div className="flex items-center justify-end gap-1.5 text-[10px] mono text-[var(--muted)] uppercase tracking-widest">
                  Next <ArrowRight size={10} />
                </div>
                <p className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {nextPost.title}
                </p>
                <div className="flex flex-wrap gap-1 justify-end mt-auto">
                  {nextPost.tags.slice(0, 2).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl border border-[var(--border)] border-dashed h-full flex items-center justify-center">
                <p className="text-xs text-[var(--muted)] opacity-40">Latest post</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Related posts in same tag(s) ── */}
      {others.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Tag size={13} className="text-[var(--accent)]" />
            <h3 className="font-bold text-[var(--text)] text-base">
              More in{' '}
              {currentTags.slice(0, 2).map((t, i) => (
                <span key={t}>
                  {i > 0 && <span className="text-[var(--muted)]">, </span>}
                  <span className="text-[var(--accent)]">{t}</span>
                </span>
              ))}
            </h3>
            <span className="ml-auto mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
              A → Z
            </span>
          </div>

          <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
            {others.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className={`group flex items-start gap-4 p-4 bg-[var(--surface)] hover:bg-[var(--surface2)] transition-colors ${
                  i !== others.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}>
                {/* Number */}
                <span className="mono text-xs text-[var(--muted)] opacity-50 shrink-0 w-5 pt-0.5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug truncate">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                      <Calendar size={9} />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {post.tags.slice(0, 2).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>

                <ArrowRight size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
