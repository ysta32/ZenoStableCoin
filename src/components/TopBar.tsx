import { ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { IconRotate, IconCheck, IconX } from './Icons'

export function TopBar({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  const { resetDemo, isExecuting, toast, sidebarOpen, setSidebarOpen } = useApp()
  const [armed, setArmed] = useState(false)
  const armTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (armTimerRef.current) clearTimeout(armTimerRef.current)
    }
  }, [])

  const arm = () => {
    if (isExecuting) {
      toast('Wait for payroll to finish before resetting', 'amber')
      return
    }
    setArmed(true)
    if (armTimerRef.current) clearTimeout(armTimerRef.current)
    armTimerRef.current = window.setTimeout(() => setArmed(false), 3000)
  }

  const cancel = () => {
    setArmed(false)
    if (armTimerRef.current) clearTimeout(armTimerRef.current)
  }

  const confirm = () => {
    setArmed(false)
    if (armTimerRef.current) clearTimeout(armTimerRef.current)
    resetDemo()
  }

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border-subtle bg-bg-base px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="focus-ring -ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-text-secondary hover:bg-bg-inset hover:text-text-primary lg:hidden"
          aria-label="Open menu"
          aria-controls="app-sidebar"
          aria-expanded={sidebarOpen}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[22px] font-medium leading-tight text-text-primary sm:text-[26px]">
            {title}
          </h1>
          {subtitle && <p className="truncate text-[13px] text-text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 max-sm:w-full sm:gap-3">
        <span
          className="inline-flex h-7 items-center rounded-full border border-border-subtle bg-bg-inset px-2.5 text-[11.5px] font-medium text-text-secondary"
          title="Nothing here touches a real chain or bank. Balances and payouts are simulated."
        >
          Demo<span className="max-sm:hidden"> · simulated funds</span>
          <span className="sr-only">
            . Nothing here touches a real chain or bank. Balances and payouts are simulated.
          </span>
        </span>
        {children}
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            {armed ? (
              <motion.div
                key="armed"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1.5 rounded-control border border-negative/40 bg-negative-soft px-1.5 py-1 text-[12px]"
              >
                <span className="px-1.5 text-negative">Reset demo?</span>
                <button
                  onClick={cancel}
                  className="focus-ring inline-flex h-7 items-center gap-1 rounded-[5px] px-2 text-text-secondary transition-colors hover:bg-bg-inset hover:text-text-primary"
                  aria-label="Cancel reset"
                >
                  <IconX width={11} height={11} /> Cancel
                </button>
                <button
                  onClick={confirm}
                  autoFocus
                  className="focus-ring inline-flex h-7 items-center gap-1 rounded-[5px] bg-negative px-2 text-text-inverse transition-colors hover:opacity-90"
                  aria-label="Confirm reset"
                >
                  <IconCheck width={11} height={11} /> Confirm
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="idle"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onClick={arm}
                disabled={isExecuting}
                className="focus-ring group inline-flex h-9 items-center gap-1.5 rounded-control border border-border-subtle bg-transparent px-2.5 text-[12px] text-text-muted transition-colors hover:border-border hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-subtle disabled:hover:text-text-muted"
                title={
                  isExecuting ? 'Reset disabled while payroll is executing' : 'Reset demo state'
                }
                aria-label="Reset demo"
                aria-disabled={isExecuting}
              >
                <IconRotate
                  width={12}
                  height={12}
                  className="transition-transform group-hover:-rotate-90 group-disabled:transform-none"
                />
                Reset
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
