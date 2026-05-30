import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-8xl font-bold text-[var(--text)] mb-4 opacity-10">404</p>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Page not found</h1>
        <p className="text-sm text-[var(--muted)] mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--accent-hover)] transition-colors">
          Go home
        </Link>
      </div>
    </div>
  )
}
