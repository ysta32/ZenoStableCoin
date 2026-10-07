import { MouseEvent } from 'react'
import { useApp } from '../context/AppContext'

export function NotFound() {
  const { navigate } = useApp()

  const go = (r: 'landing' | 'app') => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigate(r)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6 text-center text-text-primary">
      <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-text-secondary">404</div>
      <h1 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-[15px] text-text-secondary">
        The page you were looking for doesn’t exist or has moved.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <a
          href="/"
          onClick={go('landing')}
          className="rounded-md border border-border-subtle px-4 py-2 text-[14px] font-medium text-text-primary hover:bg-bg-base/60"
        >
          Back home
        </a>
        <a
          href="/app"
          onClick={go('app')}
          className="rounded-md bg-brand-500 px-4 py-2 text-[14px] font-medium text-white hover:bg-brand-600"
        >
          Open the app
        </a>
      </div>
    </main>
  )
}
