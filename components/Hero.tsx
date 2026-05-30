'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, Cloud, GitBranch, Server, Shield } from 'lucide-react'

const titles = [
  'Network Engineer @ Airtel',
  'Cloud Infrastructure Builder',
  'DevOps Practitioner',
  'AWS Architect',
  'CI/CD Pipeline Designer',
]

const floatingIcons = [
  { Icon: Cloud, style: 'top-1/4 left-8 opacity-10', delay: '0s', size: 28 },
  { Icon: Server, style: 'top-1/3 right-12 opacity-10', delay: '1.5s', size: 22 },
  { Icon: GitBranch, style: 'bottom-1/3 left-16 opacity-10', delay: '0.8s', size: 20 },
  { Icon: Shield, style: 'bottom-1/4 right-8 opacity-10', delay: '2s', size: 24 },
]

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentTitle = titles[titleIndex]

    if (!isDeleting && displayed === currentTitle) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000)
      return
    }

    if (isDeleting && displayed === '') {
      setIsDeleting(false)
      setTitleIndex((i) => (i + 1) % titles.length)
      return
    }

    const speed = isDeleting ? 40 : 80
    timeoutRef.current = setTimeout(() => {
      setDisplayed((d) =>
        isDeleting
          ? d.slice(0, -1)
          : currentTitle.slice(0, d.length + 1)
      )
    }, speed)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [displayed, isDeleting, titleIndex])

  return (
    <section className="relative min-h-screen grid-bg flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Floating decorative icons */}
      {floatingIcons.map(({ Icon, style, delay, size }, i) => (
        <div
          key={i}
          className={`absolute text-[var(--accent)] pointer-events-none animate-float ${style}`}
          style={{ animationDelay: delay }}
        >
          <Icon size={size} />
        </div>
      ))}

      {/* Glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Avatar */}
        <div className="animate-fade-up delay-100 flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[var(--accent)] to-transparent opacity-40 blur-sm" />
            <Image
              src="/avatar.png"
              alt="Naveen Meel"
              width={120}
              height={120}
              className="relative rounded-full border-2 border-[var(--accent)] object-cover"
              priority
            />
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[var(--green)] rounded-full border-2 border-[var(--bg)] animate-pulse-slow" />
          </div>
        </div>

        {/* Name */}
        <div className="animate-fade-up delay-200">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">
            ~/hello-world
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--text)] tracking-tight mb-4">
            Naveen Meel
          </h1>
        </div>

        {/* Typewriter */}
        <div className="animate-fade-up delay-300 h-8 flex items-center justify-center mb-6">
          <p className="mono text-sm md:text-base text-[var(--muted)]">
            <span className="text-[var(--accent)]">$ </span>
            {displayed}
            <span className="animate-blink text-[var(--accent)]">|</span>
          </p>
        </div>

        {/* Brief tagline */}
        <p className="animate-fade-up delay-400 text-[var(--muted)] text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10">
          Building reliable cloud infrastructure and automating the boring stuff.
          Based in Gurugram, India.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-up delay-500 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#contact"
            className="px-6 py-2.5 bg-[var(--accent)] text-[var(--bg)] font-medium text-sm rounded-lg hover:opacity-90 transition-all duration-200 mono tracking-wide"
          >
            get in touch
          </a>
          <a
            href="/Naveen_Resume.pdf"
            download
            className="px-6 py-2.5 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-medium text-sm rounded-lg transition-all duration-200 mono tracking-wide"
          >
            download cv
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-up delay-600 flex flex-col items-center gap-2 text-[var(--muted)]">
          <p className="mono text-xs tracking-widest opacity-50">scroll</p>
          <ArrowDown size={14} className="opacity-40 animate-bounce" />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
    </section>
  )
}
