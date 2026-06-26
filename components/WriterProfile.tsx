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
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <p className="mono text-[11px] text-[var(--muted)] tracking-[0.25em] uppercase font-semibold">
          About the author
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-6 px-6 space-y-5">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center gap-4">
          {imgError ? (
            <div className="w-48 h-48 rounded-full bg-[var(--surface2)] border-2 border-[var(--accent)] flex items-center justify-center">
              <span className="text-7xl font-bold text-[var(--accent)]">N</span>
            </div>
          ) : (
            <img
              src="/avatar.png"
              alt="Naveen Meel"
              className="w-48 h-48 rounded-full object-cover border-2 border-[var(--accent)] shrink-0 shadow-lg"
              onError={() => setImgError(true)}
            />
          )}
          <div>
            <p className="font-bold text-[var(--text)] text-xl leading-tight">Naveen Meel</p>
            <p className="mono text-sm text-[var(--accent)] mt-1 tracking-wide">
              Cloud & DevOps Engineer
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Meta */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <Briefcase size={14} className="text-[var(--accent)] shrink-0" />
            <span>NOC Engineer @ Airtel</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <MapPin size={14} className="text-[var(--accent)] shrink-0" />
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
            Stack
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
            className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Linkedin size={15} className="shrink-0" />
            linkedin.com/in/naveenmeel
          </a>
          <a
            href="https://github.com/naveendot1q"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Github size={15} className="shrink-0" />
            github.com/naveendot1q
          </a>
          <a
            href="mailto:naveenmeel10@gmail.com"
            className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
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
          className="mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors tracking-wide"
        >
          ← back to portfolio
        </Link>
      </div>
    </aside>
  )
}
