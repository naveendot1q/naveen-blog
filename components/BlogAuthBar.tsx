'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'

export default function BlogAuthBar() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/blog/login')
    router.refresh()
  }

  if (!email) return null

  return (
    /*
     * Fixed at top-[57px] — directly below the fixed Navbar (which is ~57px tall).
     * z-40 keeps it below the Navbar (z-50) but above page content.
     * This prevents the double-header overlap on blog pages.
     */
    <div className="fixed top-[57px] left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--surface)] bg-opacity-95 backdrop-blur-sm px-6 py-2">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <User size={11} className="text-[var(--accent)]" />
          <span className="font-medium">{email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-red-400 transition-colors font-medium"
        >
          <LogOut size={11} /> Sign out
        </button>
      </div>
    </div>
  )
}
