import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { IconCheck } from './Icons'

export function ToastHost() {
  const { toasts, dismissToast } = useApp()
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 sm:bottom-5 sm:right-5"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => dismissToast(t.id)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto focus-ring group flex min-h-[40px] items-center gap-2.5 rounded-card border border-border-subtle bg-bg-surface px-3.5 py-2.5 text-left text-[13px] shadow-pop transition-colors hover:border-border"
            title="Click to dismiss"
            aria-label={`${t.msg} (click to dismiss)`}
          >
            {t.tone === 'green' ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-positive-soft text-positive">
                <IconCheck width={12} height={12} />
              </span>
            ) : t.tone === 'amber' ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning-soft text-warning">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-inset text-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
              </span>
            )}
            <span className="text-text-primary">{t.msg}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
