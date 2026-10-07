import { useEffect, useRef, useState } from 'react'
import { Logo } from '../../components/Logo'
import { Button } from '../../components/UI'
import { useApp } from '../../context/AppContext'
import { preloadView } from '../../preload'
import { Container, GitHubIcon, LIClose, LIMenu, LIMoon, LISun, REPO_URL } from './shared'

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#pricing', label: 'Pricing calculator' },
  { href: '#developers', label: 'Developers' },
  { href: '#faq', label: 'FAQ' },
]

function ThemeToggle() {
  const { theme, setTheme } = useApp()
  const isDark =
    theme === 'dark' || (theme === 'system' && typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-text-secondary transition-colors hover:bg-text-primary/[0.05] hover:text-text-primary focus-ring"
    >
      {isDark ? <LISun /> : <LIMoon />}
    </button>
  )
}

export function Nav() {
  const { navigate } = useApp()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const prefetch = () => {
    void preloadView.dashboard()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const linkClass =
    'rounded-[4px] text-[14px] text-text-secondary transition-colors hover:text-text-primary focus-ring'

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#top" className="rounded-[4px] focus-ring" aria-label="Zeno, back to top">
          <Logo size={26} />
        </a>
        <nav aria-label="Primary" className="hidden flex-1 items-center gap-7 pl-6 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-[6px] px-3 text-[14px] text-text-secondary transition-colors hover:bg-text-primary/[0.05] hover:text-text-primary focus-ring"
          >
            <GitHubIcon />
            GitHub
          </a>
          <Button variant="primary" onClick={() => navigate('app')} onMouseEnter={prefetch} onFocus={prefetch} className="ml-1.5">
            Open the demo
          </Button>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] text-text-primary hover:bg-text-primary/[0.05] focus-ring"
          >
            {open ? <LIClose /> : <LIMenu />}
          </button>
        </div>
      </Container>
      {open && (
        <div id="mobile-menu" className="border-t border-border-subtle bg-bg-base md:hidden">
          <Container className="py-3">
            <nav aria-label="Mobile">
              <ul>
                {LINKS.map((l) => (
                  <li key={l.href} className="border-b border-border-subtle">
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex h-12 items-center text-[16px] text-text-primary focus-ring"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
                <li className="border-b border-border-subtle">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 items-center gap-2 text-[16px] text-text-primary focus-ring"
                  >
                    <GitHubIcon /> GitHub
                  </a>
                </li>
              </ul>
            </nav>
            <Button variant="primary" size="lg" onClick={() => navigate('app')} className="mt-4 w-full">
              Open the demo
            </Button>
          </Container>
        </div>
      )}
    </header>
  )
}
