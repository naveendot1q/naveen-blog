'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { Sun, Moon, Menu, X, Terminal } from 'lucide-react'
import { usePathname } from 'next/navigation'

const homeLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '#contact' },
]

const blogLinks = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isBlogPage = pathname?.startsWith('/blog') || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')
  const links = isBlogPage ? blogLinks : homeLinks

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] bg-opacity-15 border border-[var(--accent)] border-opacity-30 flex items-center justify-center group-hover:bg-opacity-25 transition-all">
            <Terminal size={13} className="text-[var(--accent)]" />
          </div>
          <span className="font-bold text-[var(--text)] tracking-tight text-sm group-hover:text-[var(--accent)] transition-colors">
            naveenmeel
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide uppercase transition-all duration-150 ${
                pathname === link.href
                  ? 'text-[var(--accent)] bg-[var(--accent)] bg-opacity-10'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] px-6 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)] hover:bg-opacity-5 transition-all font-medium uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
