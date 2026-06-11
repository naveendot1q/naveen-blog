'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, ArrowLeft } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errParam = searchParams.get('error')
    if (errParam === 'not_approved') {
      setError('Your account is not yet approved. Please contact Naveen to get access.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    // Verify approval
    const { data: reader } = await supabase
      .from('blog_readers')
      .select('approved')
      .eq('email', email)
      .single()

    const isAdmin = email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com')

    if (!isAdmin && (!reader || !reader.approved)) {
      await supabase.auth.signOut()
      setError('Your account is not yet approved. Please contact Naveen to get access.')
      setLoading(false)
      return
    }

    const from = searchParams.get('from') || '/blog'
    router.push(from)
    router.refresh()
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-sm">
        <Link href="/"
          className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8 font-medium">
          <ArrowLeft size={12} /> Back home
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)] border-opacity-30 flex items-center justify-center">
            <Lock size={14} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--text)] text-sm leading-tight">Private Blog</p>
            <p className="text-[10px] text-[var(--muted)]">Approved readers only</p>
          </div>
        </div>

        <div className="p-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">Sign in to read</h1>
          <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
            This blog is private. You need an approved account to access it.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20">
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-[var(--muted)] mt-5 text-center leading-relaxed">
            Don&apos;t have access?{' '}
            <Link href="/blog/register" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BlogLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
