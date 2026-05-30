import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-bold text-[var(--text)] text-sm tracking-tight">naveenmeel</p>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Blog</Link>
          <a href="https://linkedin.com/in/naveenmeel" target="_blank" rel="noopener noreferrer"
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">LinkedIn</a>
          <a href="https://github.com/naveendot1q" target="_blank" rel="noopener noreferrer"
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">GitHub</a>
        </div>
        <p className="text-xs text-[var(--muted)] opacity-50">© {new Date().getFullYear()} Naveen Meel</p>
      </div>
    </footer>
  )
}
