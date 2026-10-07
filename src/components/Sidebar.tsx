import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from './Logo'
import { IconDashboard, IconPayroll, IconTreasury, IconTeam, IconTx, IconReports, IconSettings, IconChevronDown, IconX } from './Icons'
import { useApp, View, Theme } from '../context/AppContext'
import { preloadView } from '../preload'

const mainNav: { id: View; label: string; icon: React.FC<any>; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { id: 'payroll', label: 'Payroll', icon: IconPayroll, badge: 'Run' },
  { id: 'treasury', label: 'Treasury', icon: IconTreasury },
  { id: 'team', label: 'Team', icon: IconTeam },
]

const financeNav: { id: View; label: string; icon: React.FC<any> }[] = [
  { id: 'transactions', label: 'Transactions', icon: IconTx },
  { id: 'reports', label: 'Reports', icon: IconReports },
  { id: 'settings', label: 'Settings', icon: IconSettings },
]

const themeOptions: { id: Theme; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

const DESKTOP_QUERY = '(min-width: 1024px)'
const RESTORE_DELAY_MS = 400

/**
 * Deferred "focus the new view's heading" after navigating from the mobile drawer.
 * Only one restoration can be pending; it is cancelled on demand and on unmount, and it
 * never steals focus from an open dialog (command palette, shortcut help).
 */
function useHeadingFocusRestore() {
  const timerRef = useRef<number | null>(null)
  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])
  const schedule = useCallback(() => {
    cancel()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      // Never steal focus while any modal/dialog is present (palette, shortcut help, ...).
      if (document.querySelector('[aria-modal="true"], [role="dialog"]')) return
      const target = document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('main')
      if (!target) return
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }, RESTORE_DELAY_MS)
  }, [cancel])
  useEffect(() => {
    // "?" opens the shortcut help dialog; drop any pending restore so it can't race the dialog.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') cancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      cancel()
    }
  }, [cancel])
  return useMemo(() => ({ schedule, cancel }), [schedule, cancel])
}

export function Sidebar() {
  const { view, setView, navigate, toast, paletteOpen, setPaletteOpen, theme, setTheme, sidebarOpen, setSidebarOpen } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  // True only while the mobile drawer session (focus trap) is active.
  const drawerSessionRef = useRef(false)
  // True when a nav item was chosen during the current drawer session.
  const navigatingRef = useRef(false)
  const headingRestore = useHeadingFocusRestore()
  const goView = (v: View) => {
    if (drawerSessionRef.current) navigatingRef.current = true
    setView(v)
  }
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Drawer behavior below lg: Esc closes, Tab is trapped, focus returns to the opener.
  useEffect(() => {
    if (!sidebarOpen) return
    const mq = window.matchMedia(DESKTOP_QUERY)
    if (mq.matches) return
    headingRestore.cancel()
    drawerSessionRef.current = true
    navigatingRef.current = false
    returnFocusRef.current = document.activeElement as HTMLElement | null
    const aside = asideRef.current
    const focusables = () =>
      aside ? Array.from(aside.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')) : []
    const focusTimer = window.setTimeout(() => focusables()[0]?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setSidebarOpen(false)
        return
      }
      if (e.key === '?') {
        setSidebarOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onChange)
    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onChange)
      window.clearTimeout(focusTimer)
      const prev = returnFocusRef.current
      const navigated = navigatingRef.current
      returnFocusRef.current = null
      drawerSessionRef.current = false
      navigatingRef.current = false
      if (navigated) {
        // The outgoing view (and its menu button) unmounts; land on the new view's heading.
        headingRestore.schedule()
      } else if (prev && document.body.contains(prev)) {
        prev.focus()
      }
    }
  }, [sidebarOpen, setSidebarOpen, headingRestore])

  useEffect(() => {
    if (!paletteOpen) return
    headingRestore.cancel()
    if (sidebarOpen) setSidebarOpen(false)
  }, [paletteOpen, sidebarOpen, setSidebarOpen, headingRestore])

  const onThemeKey = (e: React.KeyboardEvent, i: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let next = i
    if (e.key in keys) next = (i + keys[e.key] + themeOptions.length) % themeOptions.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = themeOptions.length - 1
    else return
    e.preventDefault()
    setTheme(themeOptions[next].id)
    ;(e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus()
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-text-primary/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        ref={asideRef}
        id="app-sidebar"
        aria-label="Sidebar"
        className={[
          'flex w-[232px] shrink-0 flex-col border-r border-border-subtle bg-bg-sidebar',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[280px] max-lg:max-w-[85vw] max-lg:overflow-y-auto max-lg:shadow-pop',
          'max-lg:transition-[transform,visibility] max-lg:duration-200 max-lg:ease-out',
          sidebarOpen ? 'max-lg:translate-x-0 max-lg:visible' : 'max-lg:-translate-x-full max-lg:invisible',
        ].join(' ')}
      >
        <div className="flex items-start justify-between pr-3">
          <button
            onClick={() => navigate('landing')}
            className="focus-ring rounded-control px-5 pt-5 pb-6 text-left transition-opacity hover:opacity-80"
            title="Back to homepage"
          >
            <Logo />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="focus-ring mt-3 inline-flex h-9 w-9 items-center justify-center rounded-control text-text-muted hover:bg-bg-inset hover:text-text-primary lg:hidden"
            aria-label="Close menu"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        <nav className="flex-1 px-3" aria-label="Primary">
          <SectionLabel>Main</SectionLabel>
          <ul className="space-y-0.5">
            {mainNav.map((item) => (
              <NavItem key={item.id} item={item} active={view === item.id} onClick={() => goView(item.id)} onPrefetch={() => preloadView[item.id]()} />
            ))}
          </ul>

          <SectionLabel className="mt-7">Finance</SectionLabel>
          <ul className="space-y-0.5">
            {financeNav.map((item) => (
              <NavItem key={item.id} item={item} active={view === item.id} onClick={() => goView(item.id)} onPrefetch={() => preloadView[item.id]()} />
            ))}
          </ul>

          <button
            onClick={() => {
              setSidebarOpen(false)
              setPaletteOpen(true)
            }}
            className="focus-ring mt-5 flex min-h-[36px] w-full items-center justify-between rounded-control border border-border bg-bg-surface px-3 py-2 text-[12px] text-text-muted transition-colors hover:text-text-secondary"
            title="Command palette"
          >
            <span className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Search…
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono tabular-nums rounded border border-border-subtle bg-bg-inset px-1 py-px text-[10px]">{isMac ? '⌘' : 'Ctrl'}</kbd>
              <kbd className="font-mono tabular-nums rounded border border-border-subtle bg-bg-inset px-1 py-px text-[10px]">K</kbd>
            </span>
          </button>
        </nav>

        <div className="relative space-y-3 p-3" ref={menuRef}>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute bottom-full left-3 right-3 z-30 mb-1 overflow-hidden rounded-card border border-border-subtle bg-bg-elevated shadow-pop"
                role="menu"
              >
                <button
                  role="menuitem"
                  className="focus-ring block min-h-[36px] w-full px-3 py-2.5 text-left text-[13px] text-text-secondary transition-colors hover:bg-bg-inset hover:text-text-primary"
                  onClick={() => { setMenuOpen(false); toast('Only Acme Co is set up in this demo') }}
                >
                  Switch workspace
                </button>
                <div className="border-t border-border-subtle" />
                <button
                  role="menuitem"
                  className="focus-ring block min-h-[36px] w-full px-3 py-2.5 text-left text-[13px] text-text-secondary transition-colors hover:bg-bg-inset hover:text-text-primary"
                  onClick={() => { setMenuOpen(false); toast('Signed out (demo)') }}
                >
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-0.5 rounded-control border border-border-subtle bg-bg-inset p-0.5">
            {themeOptions.map((o, i) => {
              const on = theme === o.id
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onKeyDown={(e) => onThemeKey(e, i)}
                  onClick={() => setTheme(o.id)}
                  className={[
                    'focus-ring min-h-[28px] rounded-[5px] px-2 text-[12px] transition-colors',
                    on ? 'bg-bg-surface font-medium text-text-primary shadow-card' : 'text-text-muted hover:text-text-primary',
                  ].join(' ')}
                >
                  {o.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Workspace menu"
            className="focus-ring flex w-full items-center gap-3 rounded-card border border-border-subtle bg-bg-surface px-3 py-2.5 text-left transition-colors hover:border-border"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-bg-inset text-[12px] font-semibold text-text-primary ring-1 ring-border-subtle">AC</div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium leading-tight text-text-primary">Acme Co</div>
              <div className="text-[11.5px] leading-tight text-text-muted">Demo workspace</div>
            </div>
            <IconChevronDown width={14} height={14} className={`shrink-0 text-text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center justify-between px-1 text-[11px] text-text-muted">
            <p>Prototype · mock data</p>
            <button
              onClick={() => navigate('download')}
              className="focus-ring rounded-control underline-offset-2 transition-colors hover:text-text-primary hover:underline"
            >
              Get the app
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`eyebrow px-3 pb-2 pt-2 ${className}`}>{children}</div>
}

function NavItem({ item, active, onClick, onPrefetch }: { item: { label: string; icon: React.FC<any>; badge?: string }; active: boolean; onClick: () => void; onPrefetch?: () => void }) {
  const Icon = item.icon
  return (
    <li>
      <button
        onClick={onClick}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
        aria-current={active ? 'page' : undefined}
        className={[
          'focus-ring group flex min-h-[36px] w-full items-center gap-3 rounded-control px-3 py-2 text-[13.5px] transition-colors duration-150',
          active ? 'bg-bg-surface font-medium text-text-primary shadow-card ring-1 ring-border-subtle' : 'text-text-secondary hover:bg-bg-inset hover:text-text-primary',
        ].join(' ')}
      >
        <Icon className={active ? 'text-brand-500' : ''} />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <span className="rounded-[4px] bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-500">
            {item.badge}
          </span>
        )}
      </button>
    </li>
  )
}
