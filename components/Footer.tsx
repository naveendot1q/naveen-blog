import { Terminal } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <Terminal size={14} className="text-[var(--accent)]" />
          <span className="mono text-xs">
            naveen@cloud ~ built with Next.js + Supabase
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            blog
          </Link>
          <a
            href="https://linkedin.com/in/naveenmeel"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            linkedin
          </a>
          <a
            href="https://github.com/naveendot1q"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            github
          </a>
        </div>
        <p className="mono text-xs text-[var(--muted)] opacity-50">
          © {new Date().getFullYear()} Naveen Meel
        </p>
      </div>
    </footer>
  )
}
