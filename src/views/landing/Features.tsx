import { SVGProps } from 'react'
import { LIApprove, LICurrencies, LIExport, LIImport, LIKeyboard, LIYield, Section } from './shared'

const FEATURES: { icon: (p: SVGProps<SVGSVGElement>) => JSX.Element; title: string; body: string }[] = [
  {
    icon: LICurrencies,
    title: 'Multi-currency payouts',
    body: 'Pay each person in USDC, USDT or to a EUR bank account. The method lives on the contractor, so a run can mix all three.',
  },
  {
    icon: LIYield,
    title: 'Treasury yield',
    body: 'Idle balance is modeled as tokenized T-bills at an assumed 4.5% APY. The demo simulates accrual; it does not hold real assets.',
  },
  {
    icon: LIExport,
    title: 'Audit-ready exports',
    body: 'Download reports and transaction history as CSV, with amounts, dates and payout methods, ready for your accountant.',
  },
  {
    icon: LIKeyboard,
    title: 'Keyboard-first',
    body: 'A command palette and g-prefixed shortcuts reach every screen. Press ? in the demo to see the full list.',
  },
  {
    icon: LIImport,
    title: 'CSV import',
    body: 'Bring a team in from a spreadsheet: name, role, country, payout method and amount per row, instead of typing it in.',
  },
  {
    icon: LIApprove,
    title: 'Approvals',
    body: 'Every run stops at a review step showing totals and fees before anything is sent. Multi-approver policies are not built yet.',
  },
]

export function Features() {
  return (
    <Section
      n="03"
      label="Product"
      title="The parts of payroll that usually hurt."
      lead="Built around the month-end run, not around a wallet. Everything below works in the demo today."
    >
      <ul className="grid border-t border-border-subtle sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <li
            key={title}
            className={`border-b border-border-subtle py-7 sm:pr-8 ${i % 2 === 1 ? 'sm:border-l sm:pl-8 sm:pr-0' : ''}`}
          >
            <Icon className="text-text-secondary" />
            <h3 className="mt-4 text-[16px] font-semibold text-text-primary">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-[1.6] text-text-secondary">{body}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
