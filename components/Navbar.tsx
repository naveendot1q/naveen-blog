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
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isBlogPage = pathname?.startsWith('/blog') || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')
  const links = isBlogPage ? blogLinks : homeLinks

  // The actual article-reading view — TOC and WriterProfile are sticky
  // against the navbar's height (top-14), so if the navbar hides while
  // scrolling it leaves a dead gap above them. Keep it pinned here.
  const isBlogPostPage = !!pathname && pathname.startsWith('/blog/') &&
    !pathname.startsWith('/blog/login') && !pathname.startsWith('/blog/register')

  // If navigation lands on a post page while the navbar was already
  // hidden (e.g. hidden from scrolling on a previous page), un-hide it
  // immediately instead of waiting for the next scroll event.
  useEffect(() => {
    if (isBlogPostPage) setHidden(false)
  }, [isBlogPostPage])

  useEffect(() => {
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      if (isBlogPostPage) {
        // Pinned while reading — never hide, regardless of direction.
        setHidden(false)
      } else if (y > 80) {
        // Hide when scrolling down past 80px, show when scrolling up
        setHidden(y > lastY)
      } else {
        setHidden(false)
      }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isBlogPostPage])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'bg-[var(--bg)] border-b border-[var(--border)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-bold text-[var(--text)] tracking-tight text-sm hover:text-[var(--accent)] transition-colors">
          naveenmeel
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium tracking-wide uppercase"
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
              className="px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-all font-medium uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
