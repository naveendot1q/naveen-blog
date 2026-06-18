'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Save progress at these scroll thresholds (25%, 50%, 75%, 100%)
const THRESHOLDS = [0.25, 0.5, 0.75, 1.0]

export default function ReadingTracker({ postSlug }: { postSlug: string }) {
  const savedProgress = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const saveProgress = useCallback(async (progress: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const today = new Date().toISOString().slice(0, 10)
    await supabase.from('blog_reads').upsert(
      { reader_email: user.email, post_slug: postSlug, read_date: today, progress },
      { onConflict: 'reader_email,post_slug,read_date', ignoreDuplicates: false }
    )
    savedProgress.current = progress
  }, [postSlug])

  useEffect(() => {
    const article = document.getElementById('blog-article')
    if (!article) return

    const handle = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const rect = article.getBoundingClientRect()
        const scrolled = Math.max(0, window.innerHeight - rect.top)
        const raw = Math.min(1, scrolled / article.offsetHeight)
        const threshold = [...THRESHOLDS].reverse().find(t => raw >= t)
        if (threshold && threshold > savedProgress.current) {
          saveProgress(threshold)
        }
      }, 500)
    }

    window.addEventListener('scroll', handle, { passive: true })
    handle() // run once on mount (short articles may be fully visible)

    return () => {
      window.removeEventListener('scroll', handle)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [saveProgress])

  return null
}
