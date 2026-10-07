import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

type Row = { keys: string[]; label: string }

const shortcuts: { section: string; rows: Row[] }[] = [
  {
    section: 'General',
    rows: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show this help' },
      { keys: ['Esc'], label: 'Close palette · dismiss toasts' },
    ],
  },
  {
    section: 'Navigate (press g, then…)',
    rows: [
      { keys: ['g', 'd'], label: 'Dashboard' },
      { keys: ['g', 'p'], label: 'Payroll' },
      { keys: ['g', 'y'], label: 'Treasury' },
      { keys: ['g', 't'], label: 'Team' },
      { keys: ['g', 'x'], label: 'Transactions' },
      { keys: ['g', 'r'], label: 'Reports' },
      { keys: ['g', 's'], label: 'Settings' },
    ],
  },
]


function useDialogFocus(open: boolean, ref: React.RefObject<HTMLElement>, initial?: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const items = () =>
      ref.current ? Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')) : []
    const t = window.setTimeout(() => (initial?.current ?? ref.current)?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const els = items()
      if (els.length === 0) {
        e.preventDefault()
        return
      }
      const first = els[0]
      const last = els[els.length - 1]
      const active = document.activeElement
      if (!ref.current?.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      if (prev && document.body.contains(prev)) prev.focus()
    }
  }, [open, ref, initial])
}

export function ShortcutHelp() {
  const { paletteOpen, route } = useApp()
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useDialogFocus(open, dialogRef, closeRef)
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (paletteOpen) return
      if (route !== 'app') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, paletteOpen, route])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="help"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[180] flex items-center justify-center bg-text-primary/40 px-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-card border border-border-subtle bg-bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
              <h2 className="font-display text-[18px] font-medium text-text-primary">Keyboard shortcuts</h2>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-control px-2 py-1.5 text-[11px] text-text-muted transition-colors hover:bg-bg-inset hover:text-text-primary"
                aria-label="Close shortcuts"
              >
                Esc
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {shortcuts.map((group) => (
                <div key={group.section} className="mb-4 last:mb-0">
                  <div className="eyebrow mb-2">{group.section}</div>
                  <ul className="space-y-1.5">
                    {group.rows.map((r) => (
                      <li key={r.label} className="flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] text-text-secondary hover:bg-bg-inset">
                        <span>{r.label}</span>
                        <span className="flex items-center gap-1">
                          {r.keys.map((k, i) => (
                            <kbd key={i} className="rounded border border-border-subtle bg-bg-inset px-1.5 py-0.5 font-mono tabular-nums text-[10.5px] text-text-primary">
                              {k === '⌘' && !isMac ? 'Ctrl' : k}
                            </kbd>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
