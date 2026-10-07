import { MouseEvent, ReactNode, SVGProps, useEffect, useRef, useState } from 'react'
import { Logo } from '../../components/Logo'
import { Button } from '../../components/UI'
import { useApp } from '../../context/AppContext'
import { preloadView } from '../../preload'
import { Container, GitHubIcon, LICopy, LIMoon, LISun, REPO_URL } from '../landing/shared'

export const outlineButton =
  'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-[6px] border border-border bg-bg-surface text-[15px] font-medium text-text-primary shadow-card transition-colors hover:bg-bg-elevated focus-ring'

export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    width={12}
    height={12}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
    {...p}
  >
    <path d="M5 11l6-6M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowDown = (p: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    width={14}
    height={14}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
    {...p}
  >
    <path d="M8 2.5v9M4 8l4 4 4-4M3 14h10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    width={14}
    height={14}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    aria-hidden="true"
    {...p}
  >
    <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** The browser's three-dot menu button, drawn rather than typed so it reads at small sizes. */
export function MenuDots({ vertical = false, label }: { vertical?: boolean; label: string }) {
  return (
    <span className="inline-flex h-[1.2em] items-center align-[-0.2em]">
      <svg
        viewBox="0 0 16 16"
        width={14}
        height={14}
        fill="currentColor"
        aria-hidden="true"
        className={vertical ? 'rotate-90' : ''}
      >
        <circle cx="3" cy="8" r="1.4" />
        <circle cx="8" cy="8" r="1.4" />
        <circle cx="13" cy="8" r="1.4" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** An on-screen control name, set like a key cap: "File", "Add to Dock". */
export function Key({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-[4px] border border-border-subtle bg-bg-inset px-1.5 py-px text-[13px] font-medium text-text-primary">
      {children}
    </span>
  )
}

/** Quiet external link with a trailing arrow. */
export function OutLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 rounded-[2px] text-text-primary underline decoration-border underline-offset-[3px] transition-colors hover:decoration-text-primary focus-ring ${className}`}
    >
      {children}
      <ArrowUpRight className="text-text-muted" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/** Copy button with an inline "Copied" confirmation announced to screen readers. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useApp()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast('Could not copy. Select the commands and copy them manually.', 'amber')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="inline-flex h-9 min-w-[76px] items-center justify-center gap-1.5 rounded-[6px] px-2.5 text-[12.5px] text-text-secondary transition-colors hover:bg-text-primary/[0.05] hover:text-text-primary focus-ring"
    >
      {copied ? <Check className="text-positive" /> : <LICopy />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useApp()
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'))
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

const LINKS = [
  { href: '#install', label: 'Install' },
  { href: '#source', label: 'Source' },
  { href: '#run', label: 'Run locally' },
  { href: '#deploy', label: 'Deploy' },
  { href: '#notes', label: 'Release notes' },
]

/** Compact header for /download: the landing nav's in-page links point at landing sections. */
export function DownloadHeader() {
  const { navigate } = useApp()
  const prefetch = () => {
    void preloadView.dashboard()
  }
  const toLanding = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate('landing')
  }
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={toLanding}
            className="rounded-[4px] focus-ring"
            aria-label="Zeno home"
          >
            <Logo size={26} />
          </a>
          <span aria-hidden="true" className="h-5 w-px rotate-[20deg] bg-border" />
          <span className="text-[14px] text-text-secondary">Download</span>
        </div>
        <nav aria-label="On this page" className="hidden flex-1 items-center gap-6 pl-4 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-[4px] text-[14px] text-text-secondary transition-colors hover:text-text-primary focus-ring"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center gap-2 rounded-[6px] px-3 text-[14px] text-text-secondary transition-colors hover:bg-text-primary/[0.05] hover:text-text-primary focus-ring sm:inline-flex"
          >
            <GitHubIcon />
            GitHub
          </a>
          <Button
            variant="secondary"
            onClick={() => navigate('app')}
            onMouseEnter={prefetch}
            onFocus={prefetch}
            className="ml-1.5"
          >
            Open the app
          </Button>
        </div>
      </Container>
    </header>
  )
}
