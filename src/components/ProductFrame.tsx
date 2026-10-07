import { ReactNode } from 'react'
import { LogoMark } from './Logo'
import { Avatar, MethodBadge, Pill } from './UI'
import {
  IconDashboard,
  IconPayroll,
  IconReports,
  IconSettings,
  IconTeam,
  IconTreasury,
  IconTx,
} from './Icons'
import { team, treasury, type Method } from '../data'
import { formatUSD } from '../lib/money'

/*
 * Static, non-interactive miniature of the Zeno app, composed from the same
 * tokens and seed data as the real Dashboard and Payroll views. It is purely
 * illustrative: everything inside is aria-hidden and inert to pointer input.
 */

const monthly = team.reduce((s, m) => s + m.amount, 0)
const FEE_RATE = 0.002

/** Six month-end treasury balances ending at the seed balance. */
const SERIES = [318400, 331250, 344900, 352300, 371650, treasury.balance]
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

function BrowserChrome({
  url,
  children,
  className = '',
}: {
  url: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-[12px] border border-border bg-bg-surface shadow-pop ${className}`}
    >
      <div className="flex h-9 items-center gap-3 border-b border-border-subtle bg-bg-sidebar px-3.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-border bg-bg-inset" />
          <span className="h-2.5 w-2.5 rounded-full border border-border bg-bg-inset" />
          <span className="h-2.5 w-2.5 rounded-full border border-border bg-bg-inset" />
        </div>
        <div className="font-mono tabular-nums mx-auto flex h-6 min-w-0 max-w-[280px] flex-1 items-center justify-center truncate rounded-[5px] border border-border-subtle bg-bg-surface px-3 text-[11px] text-text-muted">
          {url}
        </div>
        <div className="w-[42px]" />
      </div>
      {children}
    </div>
  )
}

function SideItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof IconDashboard
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`flex h-7 items-center gap-2 rounded-[5px] px-2 text-[12px] ${
        active
          ? 'bg-bg-surface text-text-primary shadow-card ring-1 ring-border-subtle'
          : 'text-text-secondary'
      }`}
    >
      <Icon width={14} height={14} />
      {label}
    </div>
  )
}

function Kpi({
  label,
  value,
  sub,
  positive,
}: {
  label: string
  value: string
  sub: string
  positive?: boolean
}) {
  return (
    <div className="bg-bg-surface px-3.5 py-3">
      <div className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</div>
      <div className="num mt-1.5 text-[17px] font-medium tracking-tight text-text-primary sm:text-[19px]">
        {value}
      </div>
      <div className={`mt-0.5 text-[10.5px] ${positive ? 'text-positive' : 'text-text-muted'}`}>
        {sub}
      </div>
    </div>
  )
}

function BalanceChart() {
  const w = 600
  const h = 150
  const min = 300000
  const max = 400000
  const pts = SERIES.map(
    (v, i) => [(i / (SERIES.length - 1)) * w, h - ((v - min) / (max - min)) * h] as const,
  )
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${w} ${h} L0 ${h} Z`
  return (
    <div>
      <div className="relative h-[110px] sm:h-[150px]">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-px bg-border-subtle" />
          ))}
        </div>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-brand-500"
        >
          <path d={area} fill="currentColor" opacity={0.07} />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="num mt-2 flex justify-between text-[10px] text-text-muted">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

const RUNS: { label: string; detail: string; amount: number; tone: 'positive' | 'neutral' }[] = [
  {
    label: 'September payroll',
    detail: `${team.length} contractors`,
    amount: -monthly,
    tone: 'neutral',
  },
  { label: 'T-bill token yield', detail: 'Accrued', amount: 612, tone: 'positive' },
  { label: 'Deposit', detail: 'Wire · USDC', amount: 50000, tone: 'positive' },
  {
    label: 'August payroll',
    detail: `${team.length} contractors`,
    amount: -24900,
    tone: 'neutral',
  },
]

function DashboardScreen() {
  return (
    <div className="flex min-h-0">
      <aside className="hidden w-[176px] shrink-0 border-r border-border-subtle bg-bg-sidebar p-3 md:block">
        <div className="flex items-center gap-2 px-2 pb-4 pt-1 text-text-primary">
          <LogoMark size={16} className="text-brand-500" />
          <span className="font-display text-[15px] font-medium leading-none">Zeno</span>
        </div>
        <div className="space-y-0.5">
          <SideItem icon={IconDashboard} label="Dashboard" active />
          <SideItem icon={IconPayroll} label="Payroll" />
          <SideItem icon={IconTreasury} label="Treasury" />
          <SideItem icon={IconTeam} label="Team" />
        </div>
        <div className="mt-4 px-2 pb-1 text-[9.5px] uppercase tracking-[0.08em] text-text-muted">
          Finance
        </div>
        <div className="space-y-0.5">
          <SideItem icon={IconTx} label="Transactions" />
          <SideItem icon={IconReports} label="Reports" />
          <SideItem icon={IconSettings} label="Settings" />
        </div>
      </aside>
      <div className="min-w-0 flex-1 bg-bg-base">
        <div className="flex h-12 items-center justify-between border-b border-border-subtle px-4 sm:px-5">
          <div className="font-display text-[18px] leading-none text-text-primary">Dashboard</div>
          <div className="flex h-7 items-center rounded-[5px] bg-brand-500 px-2.5 text-[11px] font-medium text-text-inverse">
            Run payroll
          </div>
        </div>
        <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-border-subtle bg-border-subtle lg:grid-cols-4">
            <Kpi
              label="Treasury balance"
              value={formatUSD(treasury.balance)}
              sub={`${formatUSD(treasury.yieldMtd, { sign: true })} MTD`}
              positive
            />
            <Kpi label="Yield (APY)" value={`${treasury.apy.toFixed(1)}%`} sub="Simulated" />
            <Kpi
              label="Monthly payroll"
              value={formatUSD(monthly)}
              sub={`${team.length} contractors`}
            />
            <Kpi label="Avg settlement" value="< 3 min" sub="0.2% fee" />
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
            <div className="rounded-[8px] border border-border-subtle bg-bg-surface p-3.5 lg:col-span-3">
              <div className="flex items-baseline justify-between">
                <div className="text-[12px] font-medium text-text-primary">Treasury balance</div>
                <div className="num text-[10.5px] text-text-muted">6 months</div>
              </div>
              <div className="mt-3">
                <BalanceChart />
              </div>
            </div>
            <div className="hidden rounded-[8px] border border-border-subtle bg-bg-surface sm:block lg:col-span-2">
              <div className="border-b border-border-subtle px-3.5 py-2.5 text-[12px] font-medium text-text-primary">
                Recent activity
              </div>
              <ul>
                {RUNS.map((r) => (
                  <li
                    key={r.label}
                    className="flex items-center justify-between gap-3 border-b border-border-subtle px-3.5 py-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[11.5px] text-text-primary">{r.label}</div>
                      <div className="text-[10.5px] text-text-muted">{r.detail}</div>
                    </div>
                    <div
                      className={`num text-[11.5px] ${r.tone === 'positive' ? 'text-positive' : 'text-text-primary'}`}
                    >
                      {formatUSD(r.amount, { sign: true })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Payroll "review and send" step, shown as a second, offset window. */
function ExecuteScreen() {
  const fee = monthly * FEE_RATE
  return (
    <div className="bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Step 3 of 3</div>
          <div className="mt-0.5 font-display text-[16px] leading-tight text-text-primary">
            Review and send
          </div>
        </div>
        <Pill tone="warning">Awaiting approval</Pill>
      </div>
      <ul className="px-4">
        {team.slice(0, 4).map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 border-b border-border-subtle py-2">
            <Avatar initials={m.initials} color="" size={22} />
            <div className="min-w-0 flex-1 truncate text-[11.5px] text-text-primary">{m.name}</div>
            <MethodBadge method={m.method as Method} />
            <div className="num w-[64px] text-right text-[11.5px] text-text-primary">
              {formatUSD(m.amount)}
            </div>
          </li>
        ))}
        <li className="py-1.5 text-[10.5px] text-text-muted">and {team.length - 4} more</li>
      </ul>
      <dl className="space-y-1 border-t border-border-subtle bg-bg-elevated px-4 py-3 text-[11.5px]">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Payroll total</dt>
          <dd className="num text-text-primary">{formatUSD(monthly, { cents: true })}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Network fee (0.2%)</dt>
          <dd className="num text-text-primary">{formatUSD(fee, { cents: true })}</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
        <span className="text-[10.5px] text-text-muted">From treasury · USDC</span>
        <span className="flex h-7 items-center rounded-[5px] bg-brand-500 px-3 text-[11px] font-medium text-text-inverse">
          Approve and send
        </span>
      </div>
    </div>
  )
}

export function ProductFrame({ className = '' }: { className?: string }) {
  return (
    <figure className={`relative ${className}`}>
      <figcaption className="sr-only">
        Illustration of the Zeno demo: a dashboard with treasury balance, yield, monthly payroll and
        recent activity, and a payroll review step awaiting approval.
      </figcaption>
      <div aria-hidden="true" className="pointer-events-none select-none">
        <BrowserChrome url="zeno demo · /app" className="lg:mr-[200px]">
          <DashboardScreen />
        </BrowserChrome>
        <div className="relative mt-4 sm:-mt-24 sm:ml-auto sm:w-[340px] lg:absolute lg:-bottom-32 lg:right-0 lg:mt-0">
          <BrowserChrome url="/app/payroll">
            <ExecuteScreen />
          </BrowserChrome>
        </div>
      </div>
    </figure>
  )
}
