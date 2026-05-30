'use client'

import { Mail, Phone, Linkedin, Github, Download, ExternalLink } from 'lucide-react'

const contacts = [
  {
    Icon: Mail,
    label: 'Email',
    value: 'naveenmeel10@gmail.com',
    href: 'mailto:naveenmeel10@gmail.com',
    display: 'naveenmeel10@gmail.com',
  },
  {
    Icon: Phone,
    label: 'Mobile',
    value: '+91 8769471595',
    href: 'tel:+918769471595',
    display: '+91 8769471595',
  },
  {
    Icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/naveenmeel',
    href: 'https://linkedin.com/in/naveenmeel',
    display: 'linkedin.com/in/naveenmeel',
    external: true,
  },
  {
    Icon: Github,
    label: 'GitHub',
    value: 'github.com/naveendot1q',
    href: 'https://github.com/naveendot1q',
    display: 'github.com/naveendot1q',
    external: true,
  },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-3">
            04 / contact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">
            Get In Touch
          </h2>
          <p className="text-[var(--muted)] mt-4 text-sm max-w-lg">
            Open to Cloud Engineer and DevOps Engineer opportunities. Drop a message or reach out directly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact cards */}
          <div className="space-y-4">
            {contacts.map(({ Icon, label, href, display, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] hover:border-opacity-50 transition-all duration-200 group"
              >
                <div className="p-2.5 rounded-lg bg-[var(--accent)] bg-opacity-10 text-[var(--accent)] group-hover:bg-opacity-20 transition-all">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase mb-0.5">{label}</p>
                  <p className="text-sm text-[var(--text)] truncate">{display}</p>
                </div>
                {external && (
                  <ExternalLink size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                )}
              </a>
            ))}

            {/* Resume download */}
            <a
              href="/Naveen_Resume.pdf"
              download="Naveen_Meel_Resume.pdf"
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--accent)] border-opacity-40 bg-[var(--accent)] bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 group"
            >
              <div className="p-2.5 rounded-lg bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]">
                <Download size={16} />
              </div>
              <div className="flex-1">
                <p className="mono text-[10px] text-[var(--muted)] tracking-widest uppercase mb-0.5">Resume</p>
                <p className="text-sm text-[var(--text)]">Naveen_Meel_Resume.pdf</p>
              </div>
              <span className="mono text-xs text-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity">
                download
              </span>
            </a>
          </div>

          {/* Quick note / CTA */}
          <div className="flex flex-col justify-center">
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <p className="mono text-xs text-[var(--accent)] tracking-[0.2em] uppercase mb-4">
                $ cat availability.txt
              </p>
              <div className="space-y-3 mono text-sm text-[var(--muted)]">
                <p>
                  <span className="text-[var(--green)]">status:</span>{' '}
                  <span className="text-[var(--text)]">actively seeking new roles</span>
                </p>
                <p>
                  <span className="text-[var(--green)]">target:</span>{' '}
                  <span className="text-[var(--text)]">Cloud Engineer / DevOps Engineer</span>
                </p>
                <p>
                  <span className="text-[var(--green)]">location:</span>{' '}
                  <span className="text-[var(--text)]">Gurugram / Remote / Hybrid</span>
                </p>
                <p>
                  <span className="text-[var(--green)]">response_time:</span>{' '}
                  <span className="text-[var(--text)]">&lt; 24 hours</span>
                </p>
                <p>
                  <span className="text-[var(--green)]">languages:</span>{' '}
                  <span className="text-[var(--text)]">English, Hindi</span>
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <a
                  href="mailto:naveenmeel10@gmail.com"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mono"
                >
                  <Mail size={14} />
                  send email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
