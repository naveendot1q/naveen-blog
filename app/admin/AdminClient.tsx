'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, LogOut,
  Loader2, X, Check, ArrowLeft, Users, FileText,
  UserCheck, UserX, Shield
} from 'lucide-react'

interface Post {
  id: string; title: string; slug: string
  published: boolean; created_at: string; tags: string[]
}
interface Reader {
  id: string; email: string; name: string
  approved: boolean; created_at: string
}
interface Props {
  posts: Post[]; readers: Reader[]; userEmail: string
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

type Tab = 'posts' | 'readers'

export default function AdminClient({ posts: initialPosts, readers: initialReaders, userEmail }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [readers, setReaders] = useState<Reader[]>(initialReaders)
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({ id: '', title: '', slug: '', excerpt: '', content: '', tags: '', published: false })
  const [quizFile, setQuizFile] = useState<File | null>(null)
  const [quizStatus, setQuizStatus] = useState<string>('')

  // Reader add form
  const [newReaderEmail, setNewReaderEmail] = useState('')
  const [newReaderName, setNewReaderName] = useState('')
  const [readerLoading, setReaderLoading] = useState(false)
  const [readerMsg, setReaderMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const resetForm = () => { setForm({ id: '', title: '', slug: '', excerpt: '', content: '', tags: '', published: false }); setError(null); setSuccess(null) }

  const startEdit = (post: Post) => {
    supabase.from('blog_posts').select('*').eq('id', post.id).single().then(({ data }) => {
      if (data) {
        setForm({ id: data.id, title: data.title, slug: data.slug, excerpt: data.excerpt || '', content: data.content || '', tags: (data.tags || []).join(', '), published: data.published })
        setMode('edit')
      }
    })
  }

  const handleSave = async (publish?: boolean) => {
    setLoading(true); setError(null); setSuccess(null)
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { title: form.title, slug: form.slug || slugify(form.title), excerpt: form.excerpt, content: form.content, tags, published: publish !== undefined ? publish : form.published, updated_at: new Date().toISOString() }
    // Validate quiz JSON if uploaded
    if (quizFile) {
      try {
        const text = await quizFile.text()
        const parsed = JSON.parse(text)
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          setError('Quiz JSON must have a "questions" array')
          setLoading(false)
          return
        }
        setQuizStatus(`✓ ${parsed.questions.length} question${parsed.questions.length !== 1 ? 's' : ''} loaded`)
      } catch {
        setError('Quiz file is not valid JSON')
        setLoading(false)
        return
      }
    }
    try {
      if (mode === 'new') {
        const { data, error: err } = await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() }).select().single()
        if (err) throw err
        setPosts(p => [data, ...p]); setSuccess('Post created!')
      } else {
        const { data, error: err } = await supabase.from('blog_posts').update(payload).eq('id', form.id).select().single()
        if (err) throw err
        setPosts(p => p.map(x => x.id === form.id ? { ...x, ...data } : x)); setSuccess('Post updated!')
      }
      setTimeout(() => { setMode('list'); resetForm(); router.refresh() }, 800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    const { error: err } = await supabase.from('blog_posts').delete().eq('id', id)
    if (!err) setPosts(p => p.filter(x => x.id !== id))
  }

  const handleTogglePublish = async (post: Post) => {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, published: !x.published } : x))
  }

  const handleToggleApproval = async (reader: Reader) => {
    const { error: err } = await supabase.from('blog_readers').update({ approved: !reader.approved }).eq('id', reader.id)
    if (!err) setReaders(r => r.map(x => x.id === reader.id ? { ...x, approved: !x.approved } : x))
  }

  const handleDeleteReader = async (id: string, email: string) => {
    if (!confirm(`Remove access for ${email}?`)) return
    const { error: err } = await supabase.from('blog_readers').delete().eq('id', id)
    if (!err) setReaders(r => r.filter(x => x.id !== id))
  }

  const handleAddReader = async (e: React.FormEvent) => {
    e.preventDefault()
    setReaderLoading(true); setReaderMsg(null)
    const { error: err } = await supabase.from('blog_readers').insert({ email: newReaderEmail, name: newReaderName, approved: true })
    if (err) {
      setReaderMsg({ type: 'err', text: err.message.includes('duplicate') ? 'This email already exists.' : err.message })
    } else {
      const newReader: Reader = { id: crypto.randomUUID(), email: newReaderEmail, name: newReaderName, approved: true, created_at: new Date().toISOString() }
      setReaders(r => [newReader, ...r])
      setNewReaderEmail(''); setNewReaderName('')
      setReaderMsg({ type: 'ok', text: `${newReaderEmail} added and approved.` })
    }
    setReaderLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); router.refresh() }

  return (
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Admin</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-1.5">
              <Shield size={10} className="text-[var(--accent)]" /> {userEmail}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium flex items-center gap-1.5"><ArrowLeft size={12} />Site</Link>
            <Link href="/blog" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium">Blog</Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:border-red-400 hover:text-red-400 transition-colors">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] w-fit mb-8">
          {([['posts', FileText, 'Posts'], ['readers', Users, 'Readers']] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => { setTab(id); setMode('list'); resetForm() }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-[var(--accent)] text-white shadow' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
              <Icon size={13} /> {label}
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white bg-opacity-20 text-white' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                {id === 'posts' ? posts.length : readers.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── POSTS TAB ── */}
        {tab === 'posts' && (
          <>
            {mode === 'list' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-[var(--muted)]">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
                  <button onClick={() => { resetForm(); setMode('new') }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-xl hover:bg-[var(--accent-hover)] transition-colors font-semibold shadow-lg shadow-amber-500/20">
                    <Plus size={14} /> New post
                  </button>
                </div>
                {posts.length === 0 ? (
                  <div className="text-center py-20 border border-[var(--border)] rounded-2xl">
                    <p className="text-sm text-[var(--muted)] mb-3">No posts yet.</p>
                    <button onClick={() => { resetForm(); setMode('new') }} className="text-xs text-[var(--accent)] underline">Write your first post →</button>
                  </div>
                ) : (
                  <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                    {posts.map((post, i) => (
                      <div key={post.id} className={`flex items-center gap-4 p-4 bg-[var(--surface)] ${i !== posts.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[var(--text)] truncate">{post.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="mono text-[10px] text-[var(--muted)]">{new Date(post.created_at).toLocaleDateString()}</span>
                            {post.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleTogglePublish(post)}
                            className={`p-2 rounded-lg border transition-colors ${post.published ? 'border-green-500 border-opacity-50 text-green-500 bg-green-500 bg-opacity-10' : 'border-[var(--border)] text-[var(--muted)]'}`}
                            title={post.published ? 'Published' : 'Draft'}>
                            {post.published ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                            <Eye size={13} />
                          </Link>
                          <button onClick={() => startEdit(post)} className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id, post.title)} className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-400 hover:border-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {(mode === 'new' || mode === 'edit') && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-[var(--text)] text-lg">{mode === 'new' ? 'New Post' : 'Edit Post'}</h2>
                  <button onClick={() => { setMode('list'); resetForm() }} className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]">
                    <X size={13} /> Cancel
                  </button>
                </div>
                {error && <div className="mb-4 p-3 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20"><p className="text-xs text-red-400">{error}</p></div>}
                {success && <div className="mb-4 p-3 rounded-xl bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 flex items-center gap-2"><Check size={13} className="text-green-400" /><p className="text-xs text-green-400">{success}</p></div>}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Title</label>
                    <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value, slug: mode === 'new' ? slugify(e.target.value) : f.slug }))}
                      placeholder="My post about Terraform..."
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors font-semibold text-base" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Slug</label>
                      <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] mono text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Tags <span className="opacity-50 font-normal">(comma separated)</span></label>
                      <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="aws, terraform, kubernetes"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] mono text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Excerpt</label>
                    <textarea value={form.excerpt} onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2}
                      placeholder="A brief description..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Content <span className="opacity-50 font-normal">(Markdown)</span></label>
                    <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} rows={22}
                      placeholder={'# My Post\n\nWrite in **Markdown**...'}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] mono text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors resize-y leading-relaxed" />
                  </div>
                </div>
                {/* Quiz file upload */}
                <div className="mt-4 p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]">
                  <p className="text-xs font-semibold text-[var(--text)] mb-1">Quiz (optional)</p>
                  <p className="mono text-[10px] text-[var(--muted)] mb-3 leading-relaxed">
                    Upload a <span className="text-[var(--accent)]">.json</span> file named <span className="text-[var(--accent)]">{form.slug || 'post-slug'}.json</span>. After saving, place it in <span className="text-[var(--accent)]">public/quizzes/</span> in your repo and redeploy.
                  </p>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={e => {
                      const f = e.target.files?.[0] || null
                      setQuizFile(f)
                      setQuizStatus(f ? `Selected: ${f.name}` : '')
                    }}
                    className="block w-full text-xs text-[var(--muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[var(--border)] file:text-xs file:text-[var(--muted)] file:bg-[var(--bg)] cursor-pointer"
                  />
                  {quizStatus && (
                    <p className={`mono text-[10px] mt-2 ${quizStatus.startsWith('✓') ? 'text-green-400' : 'text-[var(--muted)]'}`}>
                      {quizStatus}
                    </p>
                  )}
                  <details className="mt-3">
                    <summary className="mono text-[10px] text-[var(--muted)] cursor-pointer hover:text-[var(--accent)] transition-colors">Show JSON format</summary>
                    <pre className="mt-2 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] mono text-[10px] text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{`{
  "questions": [
    {
      "q": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explain": "Optional explanation shown after answering."
    }
  ]
}`}</pre>
                  </details>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <button onClick={() => handleSave(true)} disabled={loading || !form.title}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 shadow-lg shadow-amber-500/20">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Publish
                  </button>
                  <button onClick={() => handleSave(false)} disabled={loading || !form.title}
                    className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] text-[var(--muted)] text-sm rounded-xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-40">
                    Save draft
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── READERS TAB ── */}
        {tab === 'readers' && (
          <div className="space-y-8">
            {/* Add reader form */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <h3 className="font-bold text-[var(--text)] text-sm mb-4 flex items-center gap-2">
                <Plus size={14} className="text-[var(--accent)]" /> Add approved reader
              </h3>
              <form onSubmit={handleAddReader} className="flex flex-col sm:flex-row gap-3">
                <input value={newReaderName} onChange={e => setNewReaderName(e.target.value)}
                  placeholder="Name" required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors" />
                <input value={newReaderEmail} onChange={e => setNewReaderEmail(e.target.value)}
                  placeholder="Email address" type="email" required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors" />
                <button type="submit" disabled={readerLoading}
                  className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2 shadow shadow-amber-500/20">
                  {readerLoading ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />} Approve
                </button>
              </form>
              {readerMsg && (
                <p className={`mt-3 text-xs ${readerMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                  {readerMsg.text}
                </p>
              )}
              <p className="text-xs text-[var(--muted)] opacity-60 mt-3 leading-relaxed">
                Note: The reader must also create an account at <span className="mono">/blog/register</span> using this same email, or you can set their password in the Supabase Auth dashboard.
              </p>
            </div>

            {/* Readers list */}
            <div>
              <p className="text-sm text-[var(--muted)] mb-4">
                {readers.length} registered reader{readers.length !== 1 ? 's' : ''}
                {' · '}
                <span className="text-green-500">{readers.filter(r => r.approved).length} approved</span>
                {' · '}
                <span className="text-[var(--accent)]">{readers.filter(r => !r.approved).length} pending</span>
              </p>
              {readers.length === 0 ? (
                <div className="text-center py-16 border border-[var(--border)] rounded-2xl">
                  <p className="text-sm text-[var(--muted)]">No readers yet.</p>
                </div>
              ) : (
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                  {readers.map((reader, i) => (
                    <div key={reader.id} className={`flex items-center gap-4 p-4 bg-[var(--surface)] ${i !== readers.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)] border-opacity-20 flex items-center justify-center shrink-0">
                        <span className="text-[var(--accent)] text-xs font-bold">
                          {(reader.name || reader.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--text)] truncate">{reader.name || '—'}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{reader.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`mono text-[10px] px-2 py-0.5 rounded-full border ${reader.approved ? 'border-green-500 border-opacity-40 text-green-500 bg-green-500 bg-opacity-10' : 'border-amber-500 border-opacity-40 text-amber-500 bg-amber-500 bg-opacity-10'}`}>
                          {reader.approved ? 'approved' : 'pending'}
                        </span>
                        <button onClick={() => handleToggleApproval(reader)}
                          className={`p-2 rounded-lg border transition-colors ${reader.approved ? 'border-[var(--border)] text-[var(--muted)] hover:border-amber-400 hover:text-amber-400' : 'border-green-500 border-opacity-40 text-green-500 hover:bg-green-500 hover:bg-opacity-10'}`}
                          title={reader.approved ? 'Revoke access' : 'Approve access'}>
                          {reader.approved ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        <button onClick={() => handleDeleteReader(reader.id, reader.email)}
                          className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-400 hover:border-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
