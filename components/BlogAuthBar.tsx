'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, BookOpen } from 'lucide-react'

export default function BlogAuthBar() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/blog/login')
    router.refresh()
  }

  if (!email) return null

  // The Navbar is h-14 (56px). This bar sits directly below it at top-14.
  return (
    <div className="fixed top-14 left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md px-6 py-1.5">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent)] bg-opacity-10 border border-[var(--accent)] border-opacity-20">
            <BookOpen size={10} className="text-[var(--accent)]" />
            <span className="mono text-[10px] text-[var(--accent)] font-medium tracking-wide">private blog</span>
          </div>
          <span className="text-[11px] text-[var(--muted)]">{email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-red-400 transition-colors font-medium px-2 py-1 rounded-md hover:bg-red-500 hover:bg-opacity-10"
        >
          <LogOut size={11} /> Sign out
        </button>
      </div>
    </div>
  )
}
