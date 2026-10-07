import { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../../components/UI'
import { ProductFrame } from '../../components/ProductFrame'
import { useApp } from '../../context/AppContext'
import { preloadView } from '../../preload'
import { ASSUMED_APY, PROVIDERS } from '../../lib/fees'
import { Container, GitHubIcon, REPO_URL } from './shared'

const zeno = PROVIDERS.find((p) => p.id === 'zeno')

/** Mount-only fade; never hides content waiting for scroll. */
function Rise({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

const FACTS: [string, string, string, boolean?][] = [
  ['Settlement', '< 3 min', 'Illustrative, on-chain'],
  ['Fee', `${zeno?.feePct[0] ?? 0.2}%`, 'Per payment, flat'],
  ['Idle cash', `${(ASSUMED_APY * 100).toFixed(1)}%`, 'Assumed APY, simulated'],
  ['Status', 'Prototype', 'Mock data, no real funds', false],
]

export function Hero() {
  const { navigate } = useApp()
  const prefetch = () => {
    void preloadView.dashboard()
  }
  return (
    <section id="product" aria-labelledby="hero-title" className="scroll-mt-20 pb-28 pt-14 sm:pt-20 lg:pb-44">
      <Container>
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <Rise className="lg:col-span-8">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-text-secondary">
              <span className="inline-flex h-6 items-center whitespace-nowrap rounded-[5px] border border-border px-2 text-[12px] font-medium text-text-primary">
                Open-source prototype
              </span>
              <span>Stablecoin payroll for global teams</span>
            </p>
            <h1
              id="hero-title"
              className="mt-7 max-w-[760px] font-display text-[46px] font-normal leading-[1.02] tracking-[-0.025em] text-text-primary sm:text-[60px] lg:text-[72px]"
            >
              Payroll that settles in <em className="italic">minutes</em>, not days.
            </h1>
            <p className="mt-6 max-w-[600px] text-[18px] leading-[1.6] text-text-secondary">
              Pay contractors in 100+ countries in USDC or USDT from a single treasury, and let the cash you have not
              paid out yet earn yield from tokenized Treasury bills.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
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
          </Rise>
          <Rise delay={0.06} className="lg:col-span-4 lg:pt-[52px]">
            <dl className="grid grid-cols-2 border-t border-border lg:grid-cols-1">
              {FACTS.map(([k, v, note, mono = true], i) => (
                <div
                  key={k}
                  className={`flex flex-col gap-0.5 border-b border-border-subtle py-3.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-4 ${
                    i % 2 === 0 ? 'pr-4 lg:pr-0' : 'border-l pl-4 lg:border-l-0 lg:pl-0'
                  }`}
                >
                  <dt className="text-[13px] text-text-secondary">{k}</dt>
                  <dd className="lg:text-right">
                    <span className={`block text-[17px] text-text-primary ${mono ? 'num' : 'font-medium'}`}>{v}</span>
                    <span className="block text-[12px] text-text-muted">{note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Rise>
        </div>
        <Rise delay={0.12} className="mt-16 sm:mt-20">
          <ProductFrame />
        </Rise>
      </Container>
    </section>
  )
}
