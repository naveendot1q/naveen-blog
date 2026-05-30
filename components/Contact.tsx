'use client'

import { Mail, Phone, Linkedin, Github, Download, ExternalLink } from 'lucide-react'

const contacts = [
  {
    Icon: Mail,
    label: 'Email',
    href: 'mailto:naveenmeel10@gmail.com',
    display: 'naveenmeel10@gmail.com',
    external: false,
  },
  {
    Icon: Phone,
    label: 'Mobile',
    href: 'tel:+918769471595',
    display: '+91 8769471595',
    external: false,
  },
  {
    Icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/naveenmeel',
    display: 'linkedin.com/in/naveenmeel',
    external: true,
  },
  {
    Icon: Github,
    label: 'GitHub',
    href: 'https://github.com/naveendot1q',
    display: 'github.com/naveendot1q',
    external: true,
  },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">04 / contact</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">Get In Touch</h2>
          <p className="text-[var(--muted)] mt-3 text-sm max-w-lg">
            Open to Cloud Engineer and DevOps Engineer opportunities. Drop a message or reach out directly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact cards */}
          <div className="space-y-3">
            {contacts.map(({ Icon, label, href, display, external }) => (
              <a key={label} href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] transition-all duration-200 group">
                {/* Icon box - always visible */}
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)] border-opacity-20 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-all duration-200">
                  <Icon size={17} className="text-[var(--accent)] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase mb-0.5">{label}</p>
                  <p className="text-sm text-[var(--text)] font-medium truncate">{display}</p>
                </div>
                {external && <ExternalLink size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />}
              </a>
            ))}

            {/* Resume */}
            <a href="/Naveen_Resume.pdf" download="Naveen_Meel_Resume.pdf"
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--accent)] border-opacity-40 bg-[var(--accent)] bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
                <Download size={17} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase mb-0.5">Resume</p>
                <p className="text-sm text-[var(--text)] font-medium">Naveen_Meel_Resume.pdf</p>
              </div>
              <span className="mono text-xs text-[var(--accent)] font-medium">download</span>
            </a>
          </div>

          {/* Availability card */}
          <div>
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)] h-full">
              <p className="mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase mb-5">
                Availability
              </p>
              <div className="space-y-4 text-sm">
                {[
                  { key: 'Status', value: 'Actively seeking new roles', highlight: true },
                  { key: 'Target Role', value: 'Cloud Engineer / DevOps Engineer', highlight: false },
                  { key: 'Location', value: 'Gurugram / Remote / Hybrid', highlight: false },
                  { key: 'Response Time', value: '< 24 hours', highlight: false },
                  { key: 'Languages', value: 'English, Hindi', highlight: false },
                ].map(({ key, value, highlight }) => (
                  <div key={key} className="flex items-start gap-3">
                    <span className="text-[var(--muted)] shrink-0 w-28">{key}</span>
                    <span className={`font-medium ${highlight ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-[var(--border)]">
                <a href="mailto:naveenmeel10@gmail.com"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-amber-500/20">
                  <Mail size={15} />
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
