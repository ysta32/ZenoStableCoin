import { Component, ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('Zeno crash:', error, info.componentStack)
    }
  }

  reset = () => {
    this.setState({ error: null })
  }

  reload = () => {
    try {
      window.localStorage.removeItem('zeno.team')
      window.localStorage.removeItem('zeno.state.v2')
    } catch {}
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-12 text-text-primary">
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/12 text-rose-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h1 className="mt-5 text-[20px] font-semibold tracking-tight">Something went sideways</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
            Zeno hit an unexpected error. The team has been notified — try again, or reset to a clean state.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-md border border-border-subtle bg-bg-base px-3 py-2 text-left font-mono text-[11.5px] leading-relaxed text-text-muted">
            {this.state.error.message}
          </pre>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={this.reset}
              className="inline-flex h-9 items-center rounded-lg border border-border-subtle bg-white/[0.04] px-3.5 text-[13px] text-text-primary transition-colors hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Try again
            </button>
            <button
              onClick={this.reload}
              className="inline-flex h-9 items-center rounded-lg bg-brand-500 px-3.5 text-[13px] font-medium text-bg-base transition-colors hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              Reset and reload
            </button>
          </div>
        </div>
      </div>
    )
  }
}
