'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { Sun, Moon, Menu, X } from 'lucide-react'
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
      scrolled ? 'bg-[var(--bg)] border-b border-[var(--border)]' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--text)] tracking-tight hover:text-[var(--accent)] transition-colors text-sm">
          naveenmeel
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link key={link.label} href={link.href}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium tracking-wide uppercase">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200"
            aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
              className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium uppercase tracking-wide">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
