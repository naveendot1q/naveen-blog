'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail, MapPin, Briefcase } from 'lucide-react'

const skills = ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'Jenkins', 'MPLS']

export default function WriterProfile() {
  const [imgError, setImgError] = useState(false)

  return (
    <aside className="hidden xl:flex xl:flex-col w-[30%] shrink-0 self-start sticky top-14 h-[calc(100vh-56px)]">

      {/* Header — flush to top */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <span className="status-dot pulse" />
        <p className="mono text-[11px] text-[var(--muted)] tracking-[0.2em] uppercase font-semibold">
          operator
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-6 px-6 space-y-5">

        {/* Avatar + name — bracketed ID-badge frame */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="operator-frame">
            {imgError ? (
              <div className="w-full h-full rounded-sm bg-[var(--surface2)] flex items-center justify-center">
                <span className="font-display text-4xl font-bold text-[var(--signal)]">N</span>
              </div>
            ) : (
              <img
                src="/avatar.png"
                alt="Naveen Meel"
                className="w-full h-full rounded-sm object-cover shrink-0"
                onError={() => setImgError(true)}
              />
            )}
          </div>
          <div>
            <p className="font-display font-bold text-[var(--text)] text-xl leading-tight">Naveen Meel</p>
            <span className="badge-live mt-2">
              <span className="status-dot" style={{ width: 5, height: 5 }} />
              on shift
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Meta */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <Briefcase size={14} className="text-[var(--signal)] shrink-0" />
            <span>NOC Engineer @ Airtel</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <MapPin size={14} className="text-[var(--signal)] shrink-0" />
            <span>Gurugram, India</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Bio */}
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Network & Cloud Engineer specialising in MPLS, AWS, CI/CD pipelines, and
          infrastructure automation. Writing about real-world DevOps and cloud patterns.
        </p>

        {/* Skills */}
        <div>
          <p className="mono text-xs text-[var(--muted)] tracking-widest uppercase mb-3 font-semibold">
            stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span
                key={s}
                className="mono text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Links */}
        <div className="space-y-3">
          <a
            href="https://linkedin.com/in/naveenmeel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--signal)] transition-colors"
          >
            <Linkedin size={15} className="shrink-0" />
            linkedin.com/in/naveenmeel
          </a>
          <a
            href="https://github.com/naveendot1q"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--signal)] transition-colors"
          >
            <Github size={15} className="shrink-0" />
            github.com/naveendot1q
          </a>
          <a
            href="mailto:naveenmeel10@gmail.com"
            className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--signal)] transition-colors"
          >
            <Mail size={15} className="shrink-0" />
            naveenmeel10@gmail.com
          </a>
        </div>
      </div>

      {/* Footer — flush to bottom */}
      <div className="px-5 py-3 border-t border-[var(--border)]">
        <Link
          href="/"
          className="mono text-xs text-[var(--muted)] hover:text-[var(--signal)] transition-colors tracking-wide"
        >
          ← back to portfolio
        </Link>
      </div>
    </aside>
  )
}
