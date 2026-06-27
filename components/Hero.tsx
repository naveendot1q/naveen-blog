'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'

const titles = [
  'NOC Network Engineer @ Airtel',
  'Cloud Infrastructure Builder',
  'DevOps Practitioner',
  'AWS Solutions Architect',
  'CI/CD Pipeline Designer',
]

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentTitle = titles[titleIndex]
    if (!isDeleting && displayed === currentTitle) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200)
      return
    }
    if (isDeleting && displayed === '') {
      setIsDeleting(false)
      setTitleIndex((i) => (i + 1) % titles.length)
      return
    }
    const speed = isDeleting ? 35 : 75
    timeoutRef.current = setTimeout(() => {
      setDisplayed((d) => isDeleting ? d.slice(0, -1) : currentTitle.slice(0, d.length + 1))
    }, speed)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [displayed, isDeleting, titleIndex])

  return (
    <section className="relative min-h-screen grid-bg flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Photo */}
          <div className="animate-fade-up delay-100 shrink-0">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-transparent opacity-30 blur-md" />
              <Image
                src="/photo.jpg"
                alt="Naveen Meel"
                width={220}
                height={220}
                className="relative rounded-full object-cover object-top border-2 border-[var(--accent)] border-opacity-60 shadow-2xl"
                style={{ width: 220, height: 220 }}
                priority
              />
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-[var(--green)] rounded-full border-2 border-[var(--bg)] animate-pulse-slow" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <div className="animate-fade-up delay-100">
              <span className="inline-block mono text-xs text-[var(--accent)] tracking-[0.25em] uppercase mb-4 border border-[var(--accent)] border-opacity-30 px-3 py-1 rounded-full bg-[var(--accent-subtle)]">
                available for opportunities
              </span>
            </div>

            <h1 className="animate-fade-up delay-200 text-5xl md:text-6xl font-bold text-[var(--text)] tracking-tight mb-4 leading-none">
              Naveen Meel
            </h1>

            <div className="animate-fade-up delay-300 h-7 flex items-center justify-center md:justify-start mb-5">
              <p className="mono text-sm text-[var(--muted)]">
                {displayed}<span className="animate-blink text-[var(--accent)] ml-0.5">|</span>
              </p>
            </div>

            <p className="animate-fade-up delay-400 text-[var(--muted)] text-base max-w-lg mx-auto md:mx-0 leading-relaxed mb-8">
              Building reliable cloud infrastructure and automating workflows. 
              Based in Gurugram, India.
            </p>

            <div className="animate-fade-up delay-500 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a href="#contact"
                className="px-6 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-amber-500/20">
                Get in touch
              </a>
              <Link href="/blog"
                className="px-6 py-2.5 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-medium text-sm rounded-lg transition-all duration-200">
                Read blog
              </Link>
              <a href="/Naveen_Resume.pdf" download
                className="px-6 py-2.5 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-medium text-sm rounded-lg transition-all duration-200">
                Download CV
              </a>
            </div>
          </div>
        </div>

        <div className="animate-fade-up delay-600 flex justify-center mt-20 text-[var(--muted)]">
          <div className="flex flex-col items-center gap-2">
            <p className="mono text-xs tracking-widest opacity-40">scroll down</p>
            <ArrowDown size={14} className="opacity-30 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
