'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Progress thresholds at which we save to DB
const THRESHOLDS = [0.25, 0.5, 0.75, 1.0]

export default function ReadingTracker({ postSlug }: { postSlug: string }) {
  const savedProgress = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const initialized = useRef(false)

  // On mount: load any existing progress for today from DB so we
  // don't re-save a lower value if the reader already read further
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('blog_reads')
        .select('progress')
        .eq('reader_email', user.email)
        .eq('post_slug', postSlug)
        .eq('read_date', today)
        .maybeSingle()

      if (data?.progress) {
        savedProgress.current = Number(data.progress)
      }
    }

    load()
  }, [postSlug])

  const saveProgress = useCallback(async (progress: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const today = new Date().toISOString().slice(0, 10)

    const { error } = await supabase
      .from('blog_reads')
      .upsert(
        {
          reader_email: user.email,
          post_slug: postSlug,
          read_date: today,
          progress,
        },
        { onConflict: 'reader_email,post_slug,read_date' }
      )

    if (!error) {
      savedProgress.current = progress
    } else {
      console.error('[ReadingTracker] save failed:', error.message)
    }
  }, [postSlug])

  useEffect(() => {
    const article = document.getElementById('blog-article')
    if (!article) return

    const handleScroll = () => {
      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(() => {
        const rect = article.getBoundingClientRect()
        const articleHeight = article.offsetHeight
        const scrolled = Math.max(0, window.innerHeight - rect.top)
        const raw = Math.min(1, scrolled / articleHeight)

        // Find highest threshold crossed
        const threshold = [...THRESHOLDS].reverse().find(t => raw >= t)
        if (threshold && threshold > savedProgress.current) {
          saveProgress(threshold)
        }
      }, 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Fire once on mount — short articles may be fully in view immediately
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [saveProgress])

  return null
}
