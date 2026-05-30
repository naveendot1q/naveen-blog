'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Lock size={16} className="text-[var(--accent)]" />
          <span className="font-bold text-[var(--text)] text-sm">naveenmeel · admin</span>
        </div>

        <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">Sign in</h1>
          <p className="text-xs text-[var(--muted)] mb-6">Restricted to authorized users only.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="naveenmeel10@gmail.com" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-medium block mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              {loading ? <><Loader2 size={14} className="animate-spin" />Signing in...</> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
