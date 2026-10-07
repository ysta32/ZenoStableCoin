import { ReactNode } from 'react'
import { Avatar, MethodBadge, Pill } from '../../components/UI'
import { team, treasury, type Method } from '../../data'
import { formatUSD } from '../../lib/money'
import { Section } from './shared'

const total = team.reduce((s, m) => s + m.amount, 0)

function Vignette({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-[10px] border border-border-subtle bg-bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
        <span className="text-[12.5px] font-medium text-text-primary">{title}</span>
        <span className="text-[11px] text-text-muted">Demo</span>
      </div>
      {children}
    </div>
  )
}

function FundFigure() {
  return (
    <Vignette title="Treasury">
      <div className="px-4 py-4">
        <div className="text-[11px] uppercase tracking-[0.08em] text-text-muted">Balance</div>
        <div className="num mt-1 text-[24px] tracking-tight text-text-primary">{formatUSD(treasury.balance, { cents: true })}</div>
        <div className="mt-4 flex h-2 overflow-hidden rounded-[2px] bg-bg-inset">
          <div className="bg-brand-500" style={{ width: `${treasury.allocation[0].pct}%` }} />
          <div className="bg-brand-300" style={{ width: `${treasury.allocation[1].pct}%` }} />
          <div className="bg-border" style={{ width: `${treasury.allocation[2].pct}%` }} />
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2 text-[11.5px]">
          {treasury.allocation.map((a, i) => (
            <li key={a.label} className="flex items-center gap-1.5 text-text-secondary">
              <span className={`h-2 w-2 rounded-[2px] ${['bg-brand-500', 'bg-brand-300', 'bg-border'][i]}`} />
              <span className="truncate">{a.label}</span>
              <span className="num ml-auto text-text-primary">{a.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle bg-bg-elevated px-4 py-2.5 text-[12px]">
        <span className="text-text-secondary">Wire from Mercury · USDC</span>
        <span className="num text-positive">{formatUSD(50000, { sign: true, cents: true })}</span>
      </div>
    </Vignette>
  )
}

function AmountsFigure() {
  return (
    <Vignette title="October payroll">
      <table className="w-full text-[12.5px]">
        <tbody>
          {team.slice(0, 3).map((m) => (
            <tr key={m.id} className="border-b border-border-subtle last:border-0">
              <td className="py-2.5 pl-4">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={m.initials} color="" size={24} />
                  <div>
                    <div className="text-text-primary">{m.name}</div>
                    <div className="text-[11px] text-text-muted">{m.country}</div>
                  </div>
                </div>
              </td>
              <td className="py-2.5">
                <MethodBadge method={m.method as Method} />
              </td>
              <td className="py-2.5 pr-4 text-right">
                <span className="num inline-block min-w-[84px] rounded-[5px] border border-border bg-bg-surface px-2 py-1 text-text-primary">
                  {m.amount.toLocaleString('en-US')}.00
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Vignette>
  )
}

function SendFigure() {
  return (
    <Vignette title="Run summary">
      <dl className="space-y-1.5 px-4 py-3.5 text-[12.5px]">
        <div className="flex justify-between">
          <dt className="text-text-secondary">{team.length} recipients</dt>
          <dd className="num text-text-primary">{formatUSD(total, { cents: true })}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Network fee (0.2%)</dt>
          <dd className="num text-text-primary">{formatUSD(total * 0.002, { cents: true })}</dd>
        </div>
        <div className="flex justify-between border-t border-border-subtle pt-1.5">
          <dt className="text-text-primary">Debited from treasury</dt>
          <dd className="num text-text-primary">{formatUSD(total * 1.002, { cents: true })}</dd>
        </div>
      </dl>
      <ul className="border-t border-border-subtle bg-bg-elevated px-4 py-2 text-[12px]">
        {[
          ['Ana Silva', '0x7a3f…c4e2'],
          ['Rohan Kumar', '0x19b0…8d17'],
        ].map(([name, hash]) => (
          <li key={hash} className="flex items-center justify-between gap-3 py-1">
            <span className="text-text-secondary">{name}</span>
            <span className="num ml-auto text-text-muted">{hash}</span>
            <Pill tone="positive">Sent</Pill>
          </li>
        ))}
      </ul>
    </Vignette>
  )
}

const STEPS: { title: string; body: string; figure: ReactNode }[] = [
  {
    title: 'Fund the treasury',
    body: 'Deposit USDC once. Whatever is not needed for the next run can sit in tokenized Treasury bills instead of a zero-interest account.',
    figure: <FundFigure />,
  },
  {
    title: 'Set amounts',
    body: 'Each contractor has a payout method (USDC, USDT or a EUR bank account) and an amount. Import the list by CSV or edit it inline.',
    figure: <AmountsFigure />,
  },
  {
    title: 'Approve and send',
    body: 'Review the total and the fee before anything moves. Each payment gets its own transaction hash for your records.',
    figure: <SendFigure />,
  },
]

export function HowItWorks() {
  return (
    <Section
      id="how"
      n="01"
      label="How a run works"
      title="Three steps, one ledger."
      lead="A payroll run in Zeno is a single, reviewable batch. The demo walks through the same flow with mock data."
      stacked
    >
      <ol className="border-t border-border-subtle">
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid gap-x-10 gap-y-5 border-b border-border-subtle py-8 last:border-b-0 last:pb-0 sm:py-10 sm:last:pb-0 lg:grid-cols-12">
            <div className="num pt-1 text-[13px] text-text-muted lg:col-span-1">{String(i + 1).padStart(2, '0')}</div>
            <div className="lg:col-span-4">
              <h3 className="font-display text-[24px] leading-tight tracking-[-0.01em] text-text-primary">{s.title}</h3>
              <p className="mt-2.5 max-w-[420px] text-[16px] leading-[1.6] text-text-secondary">{s.body}</p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">{s.figure}</div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
