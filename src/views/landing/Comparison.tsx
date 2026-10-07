import { ASSUMED_APY, PROVIDERS, estimateAnnualCost } from '../../lib/fees'
import { formatUSD } from '../../lib/money'
import { Section } from './shared'

const ORDER = ['zeno', 'deel', 'wise', 'swift'] as const
const EXAMPLE = { monthlyPayroll: 120_000, contractors: 25, idleBalance: 0 }
const example = estimateAnnualCost(EXAMPLE)
const cols = ORDER.map((id) => {
  const p = PROVIDERS.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown provider ${id}`)
  return p
})

function pct([lo, hi]: [number, number]): string {
  return lo === hi ? `${lo}%` : `${lo}–${hi}%`
}

function feeModel(p: (typeof PROVIDERS)[number]): string {
  const parts: string[] = []
  if (p.feePct[1] > 0) parts.push(`${pct(p.feePct)} per payment`)
  if (p.flatPerPayment > 0) parts.push(`${formatUSD(p.flatPerPayment, { cents: p.flatPerPayment % 1 !== 0 })} ${p.id === 'deel' ? 'per contractor / mo' : 'per wire'}`)
  return parts.join(' + ')
}

const ROWS: { label: string; cell: (p: (typeof PROVIDERS)[number]) => string; mono?: boolean }[] = [
  { label: 'Fee model', cell: feeModel },
  { label: 'Settlement', cell: (p) => p.settlement.replace(/\s*\(illustrative\)/, '') },
  {
    label: 'Annual fees at $120k/mo, 25 contractors',
    cell: (p) => formatUSD(example.find((r) => r.id === p.id)?.annualFees ?? NaN),
    mono: true,
  },
  { label: 'Yield on idle balance', cell: (p) => (p.id === 'zeno' ? `${(ASSUMED_APY * 100).toFixed(1)}% assumed` : 'None') },
  { label: 'Source code', cell: (p) => (p.id === 'zeno' ? 'Public on GitHub' : 'Closed') },
]

export function Comparison() {
  return (
    <Section
      n="05"
      label="Comparison"
      title="Side by side."
      lead="The same assumptions as the calculator above, in one table. Midpoints are used where a provider publishes a range."
      stacked
    >
      <ul className="border-t border-border md:hidden">
        {cols.map((p) => (
          <li key={p.id} className="border-b border-border-subtle py-5">
            <h3 className={`font-display text-[20px] ${p.id === 'zeno' ? 'text-text-primary' : 'text-text-secondary'}`}>
              {p.id === 'swift' ? 'SWIFT wire' : p.name}
            </h3>
            <dl className="mt-3 space-y-2 text-[14px]">
              {ROWS.map((r) => (
                <div key={r.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
                  <dt className="text-[13px] text-text-muted">{r.label}</dt>
                  <dd className={`${p.id === 'zeno' ? 'text-text-primary' : 'text-text-secondary'} ${r.mono ? 'num' : ''}`}>
                    {r.cell(p)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden md:block">
        <table className="w-full text-[14px]">
          <caption className="sr-only">Zeno compared with Deel, Wise and SWIFT wires</caption>
          <thead>
            <tr className="border-b border-border">
              <td className="w-[28%] pb-3" />
              {cols.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className={`px-4 pb-3 pt-4 text-left font-display text-[20px] font-normal ${p.id === 'zeno' ? 'rounded-t-[8px] bg-bg-surface text-text-primary' : 'text-text-secondary'}`}
                >
                  {p.id === 'swift' ? 'SWIFT wire' : p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-b border-border-subtle align-top">
                <th scope="row" className="py-4 pr-4 text-left text-[13.5px] font-normal text-text-muted">
                  {r.label}
                </th>
                {cols.map((p) => (
                  <td
                    key={p.id}
                    className={`px-4 py-4 ${p.id === 'zeno' ? 'bg-bg-surface text-text-primary' : 'text-text-secondary'} ${r.mono ? 'num' : ''}`}
                  >
                    {r.cell(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[12.5px] text-text-muted">
        Illustrative estimates from public list prices; see sources under the calculator. Zeno figures are prototype
        assumptions, not live pricing.
      </p>
    </Section>
  )
}
