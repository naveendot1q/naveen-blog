'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail, MapPin, Briefcase } from 'lucide-react'

const skills = ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'Jenkins', 'MPLS']

export default function WriterProfile() {
  const [imgError, setImgError] = useState(false)

  return (
    // sticky top-20, full viewport height — mirrors the TOC column
    <aside className="hidden xl:flex xl:flex-col w-[30%] shrink-0 self-start sticky top-14 h-[calc(100vh-56px)]">

      {/* Header — flush to top */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="mono text-[11px] text-[var(--muted)] tracking-[0.25em] uppercase font-semibold">
          About the author
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-5 px-4 space-y-5">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center gap-3">
          {imgError ? (
            <div className="w-16 h-16 rounded-full bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--accent)]">N</span>
            </div>
          ) : (
            <img
              src="/avatar.png"
              alt="Naveen Meel"
              className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent)] shrink-0"
              onError={() => setImgError(true)}
            />
          )}
          <div>
            <p className="font-bold text-[var(--text)] text-sm leading-tight">Naveen Meel</p>
            <p className="mono text-[10px] text-[var(--accent)] mt-0.5 tracking-wide">
              Cloud & DevOps Engineer
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Briefcase size={11} className="text-[var(--accent)] shrink-0" />
            <span>NOC Engineer @ Airtel</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <MapPin size={11} className="text-[var(--accent)] shrink-0" />
            <span>Gurugram, India</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Bio */}
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Network & Cloud Engineer specialising in MPLS, AWS, CI/CD pipelines, and
          infrastructure automation. Writing about real-world DevOps and cloud patterns.
        </p>

        {/* Skills */}
        <div>
          <p className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase mb-2">
            Stack
          </p>
          <div className="flex flex-wrap gap-1">
            {skills.map(s => (
              <span
                key={s}
                className="mono text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted)]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Links */}
        <div className="space-y-2">
          <a
            href="https://linkedin.com/in/naveenmeel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Linkedin size={12} className="shrink-0" />
            linkedin.com/in/naveenmeel
          </a>
          <a
            href="https://github.com/naveendot1q"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Github size={12} className="shrink-0" />
            github.com/naveendot1q
          </a>
          <a
            href="mailto:naveenmeel10@gmail.com"
            className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Mail size={12} className="shrink-0" />
            naveenmeel10@gmail.com
          </a>
        </div>
      </div>

      {/* Footer — flush to bottom */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <Link
          href="/"
          className="mono text-[10px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors tracking-wide"
        >
          ← back to portfolio
        </Link>
      </div>
    </aside>
  )
}
