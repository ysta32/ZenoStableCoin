import { Logo } from '../../components/Logo'
import { Button } from '../../components/UI'
import { useApp } from '../../context/AppContext'
import { preloadView } from '../../preload'
import { Container, GitHubIcon, REPO_URL } from './shared'

export function FinalCta() {
  const { navigate } = useApp()
  const prefetch = () => {
    void preloadView.dashboard()
  }
  return (
    <section aria-labelledby="cta-title" className="mt-28 border-y border-border-subtle bg-bg-surface sm:mt-36">
      <Container className="grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h2
            id="cta-title"
            className="font-display text-[36px] leading-[1.06] tracking-[-0.02em] text-text-primary sm:text-[48px]"
          >
            Run a payroll end to end, <em className="italic">in the browser.</em>
          </h2>
          <p className="mt-4 max-w-[520px] text-[17px] leading-[1.6] text-text-secondary">
            The demo seeds a small team and a funded treasury. Nothing to install and no account needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
          <Button variant="primary" size="lg" onClick={() => navigate('app')} onMouseEnter={prefetch} onFocus={prefetch}>
            Open the demo
          </Button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-[6px] border border-border bg-bg-surface px-5 text-[15px] font-medium text-text-primary shadow-card transition-colors hover:bg-bg-elevated focus-ring"
          >
            <GitHubIcon />
            View on GitHub
          </a>
        </div>
      </Container>
    </section>
  )
}

export function Footer() {
  const { navigate } = useApp()
  return (
    <footer className="py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Logo size={24} />
          <span className="text-[13px] text-text-muted">© 2026 Zeno</span>
        </div>
        <p className="text-[13px] text-text-muted">Prototype. No real funds move.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('download')}
            className="inline-flex h-9 items-center rounded-[6px] text-[13px] text-text-secondary hover:text-text-primary focus-ring"
          >
            Download
          </button>
          <a
            href={`${REPO_URL}/releases`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-[6px] text-[13px] text-text-secondary hover:text-text-primary focus-ring"
          >
            Releases
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-[6px] text-[13px] text-text-secondary hover:text-text-primary focus-ring"
          >
            <GitHubIcon />
            ysta32/ZenoStableCoin
          </a>
        </div>
      </Container>
    </footer>
  )
}
