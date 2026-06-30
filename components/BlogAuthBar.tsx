'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function BlogAuthBar() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  // Hide when scrolling down, show when scrolling up — mirrors Navbar behaviour
  useEffect(() => {
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      if (y > 80) setHidden(y > lastY)
      else setHidden(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/blog/login')
    router.refresh()
  }

  if (!email) return null

  return (
    <div
      className={`fixed left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-2 transition-all duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ top: '56px' }} // exactly below h-14 (56px) Navbar
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="mono text-[10px] text-[var(--accent)] tracking-widest uppercase">
            private
          </span>
          <span className="text-[var(--border)]">·</span>
          <span className="text-xs text-[var(--muted)]">{email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <LogOut size={11} /> Sign out
        </button>
      </div>
    </div>
  )
}
