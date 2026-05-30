'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, LogOut,
  Terminal, Loader2, X, Check, ArrowLeft
} from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  created_at: string
  tags: string[]
}

interface AdminClientProps {
  posts: Post[]
  userEmail: string
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminClient({ posts: initialPosts, userEmail }: AdminClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
    published: false,
  })

  const [preview, setPreview] = useState(false)

  const resetForm = () => {
    setForm({ id: '', title: '', slug: '', excerpt: '', content: '', tags: '', published: false })
    setError(null)
    setSuccess(null)
    setPreview(false)
  }

  const startNew = () => {
    resetForm()
    setMode('new')
  }

  const startEdit = (post: Post) => {
    // Fetch full post content
    supabase
      .from('blog_posts')
      .select('*')
      .eq('id', post.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            id: data.id,
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            content: data.content || '',
            tags: (data.tags || []).join(', '),
            published: data.published,
          })
          setMode('edit')
        }
      })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setForm((f) => ({
      ...f,
      title,
      slug: mode === 'new' ? slugify(title) : f.slug,
    }))
  }

  const handleSave = async (publish?: boolean) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      tags,
      published: publish !== undefined ? publish : form.published,
      updated_at: new Date().toISOString(),
    }

    try {
      if (mode === 'new') {
        const { data, error: err } = await supabase
          .from('blog_posts')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single()
        if (err) throw err
        setPosts((p) => [data, ...p])
        setSuccess('Post created!')
      } else {
        const { data, error: err } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', form.id)
          .select()
          .single()
        if (err) throw err
        setPosts((p) => p.map((x) => (x.id === form.id ? { ...x, ...data } : x)))
        setSuccess('Post updated!')
      }

      setTimeout(() => {
        setMode('list')
        resetForm()
        router.refresh()
      }, 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const { error: err } = await supabase.from('blog_posts').delete().eq('id', id)
    if (!err) {
      setPosts((p) => p.filter((x) => x.id !== id))
    }
  }

  const handleTogglePublish = async (post: Post) => {
    const { error: err } = await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id)
    if (!err) {
      setPosts((p) => p.map((x) => (x.id === post.id ? { ...x, published: !x.published } : x)))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="mono text-xs text-[var(--accent)] tracking-widest uppercase mb-1">
              $ sudo blog-admin
            </p>
            <h1 className="text-2xl font-bold text-[var(--text)]">Blog Admin</h1>
            <p className="mono text-xs text-[var(--muted)] mt-0.5">{userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
              <ArrowLeft size={12} /> site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mono text-xs px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:border-red-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={13} /> logout
            </button>
          </div>
        </div>

        {/* List mode */}
        {mode === 'list' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--muted)]">
                {posts.length} post{posts.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={startNew}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg)] text-sm rounded-lg hover:opacity-90 transition-opacity mono"
              >
                <Plus size={14} /> new post
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-24 border border-[var(--border)] rounded-xl">
                <p className="mono text-sm text-[var(--muted)] mb-4">No posts yet</p>
                <button onClick={startNew} className="mono text-xs text-[var(--accent)] underline">
                  Write your first post →
                </button>
              </div>
            ) : (
              <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                {posts.map((post, i) => (
                  <div
                    key={post.id}
                    className={`flex items-center gap-4 p-4 bg-[var(--surface)] ${
                      i !== posts.length - 1 ? 'border-b border-[var(--border)]' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate">{post.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="mono text-[10px] text-[var(--muted)]">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        {post.tags?.slice(0, 2).map((t) => (
                          <span key={t} className="mono text-[10px] text-[var(--muted)] opacity-60">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Published toggle */}
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`p-2 rounded-lg border transition-colors ${
                          post.published
                            ? 'border-[var(--green)] text-[var(--green)] bg-green-500 bg-opacity-10'
                            : 'border-[var(--border)] text-[var(--muted)]'
                        }`}
                        title={post.published ? 'Published — click to unpublish' : 'Draft — click to publish'}
                      >
                        {post.published ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        <Eye size={13} />
                      </Link>

                      <button
                        onClick={() => startEdit(post)}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-400 hover:border-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* New/Edit mode */}
        {(mode === 'new' || mode === 'edit') && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-[var(--text)]">
                {mode === 'new' ? 'New Post' : 'Edit Post'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-1.5 mono text-xs px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                >
                  {preview ? <><X size={12} /> edit</> : <><Eye size={12} /> preview</>}
                </button>
                <button
                  onClick={() => { setMode('list'); resetForm() }}
                  className="mono text-xs px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  cancel
                </button>
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20">
                <p className="mono text-xs text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 flex items-center gap-2">
                <Check size={13} className="text-green-400" />
                <p className="mono text-xs text-green-400">{success}</p>
              </div>
            )}

            {!preview ? (
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="mono text-xs text-[var(--muted)] tracking-wider uppercase block mb-2">Title</label>
                  <input
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="My awesome post about Terraform..."
                    className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors font-medium"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="mono text-xs text-[var(--muted)] tracking-wider uppercase block mb-2">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="my-awesome-post"
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] mono text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="mono text-xs text-[var(--muted)] tracking-wider uppercase block mb-2">Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    rows={2}
                    placeholder="A brief description for the blog listing..."
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="mono text-xs text-[var(--muted)] tracking-wider uppercase block mb-2">
                    Tags <span className="opacity-50 normal-case">(comma separated)</span>
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="aws, terraform, kubernetes"
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] mono text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="mono text-xs text-[var(--muted)] tracking-wider uppercase block mb-2">
                    Content <span className="opacity-50 normal-case">(Markdown)</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    rows={20}
                    placeholder="# My Post&#10;&#10;Write your content in **Markdown**..."
                    className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] mono text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors resize-y leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[400px]">
                <h2 className="text-2xl font-bold text-[var(--text)] mb-2">{form.title || 'Untitled'}</h2>
                {form.excerpt && <p className="text-[var(--muted)] italic mb-6 border-l-2 border-[var(--accent)] pl-4">{form.excerpt}</p>}
                <div className="prose-custom">
                  {/* Simple preview without SSR */}
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--text)] opacity-80 leading-relaxed">
                    {form.content || 'Nothing to preview yet.'}
                  </pre>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => handleSave(true)}
                disabled={loading || !form.title}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mono disabled:opacity-40"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                publish
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={loading || !form.title}
                className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] text-[var(--muted)] text-sm rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors mono disabled:opacity-40"
              >
                save draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
