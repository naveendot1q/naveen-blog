'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react'

export default function BlogRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Create the auth user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Insert into blog_readers as pending (approved = false)
    // Admin must flip approved = true in Supabase dashboard to grant access
    const { error: readerError } = await supabase
      .from('blog_readers')
      .insert({ email, name, approved: false })

    if (readerError && !readerError.message.includes('duplicate')) {
      setError('Account created but failed to register for blog access. Please contact Naveen.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] mb-2">Request submitted!</h1>
          <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed max-w-xs mx-auto">
            Your account has been created. Naveen will review and approve your access shortly.
            You&apos;ll be able to sign in once approved.
          </p>
          <Link href="/blog/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-sm">
        <Link href="/blog/login"
          className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8 font-medium">
          <ArrowLeft size={12} /> Back to login
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)] border-opacity-30 flex items-center justify-center">
            <UserPlus size={14} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--text)] text-sm leading-tight">Request Access</p>
            <p className="text-[10px] text-[var(--muted)]">Pending admin approval</p>
          </div>
        </div>

        <div className="p-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">Create account</h1>
          <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
            Submit your request. Naveen will manually approve access before you can read the blog.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="Your full name" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="Min. 6 characters" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20">
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Request access'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
