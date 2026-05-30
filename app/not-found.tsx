import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="text-center">
        <p className="mono text-xs text-[var(--accent)] tracking-[0.3em] uppercase mb-4">
          $ cd /this-page
        </p>
        <p className="mono text-6xl font-bold text-[var(--text)] mb-2 opacity-20">404</p>
        <p className="mono text-sm text-[var(--muted)] mb-1">
          bash: /this-page: No such file or directory
        </p>
        <p className="text-xs text-[var(--muted)] opacity-60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mono text-sm text-[var(--accent)] hover:opacity-80 transition-opacity border border-[var(--accent)] border-opacity-40 px-6 py-2.5 rounded-lg"
        >
          $ cd ~
        </Link>
      </div>
    </div>
  )
}
