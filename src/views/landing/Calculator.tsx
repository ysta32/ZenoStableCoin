import { Fragment, useId, useMemo, useState } from 'react'
import { ASSUMED_APY, PROVIDERS, estimateAnnualCost } from '../../lib/fees'
import { formatUSD } from '../../lib/money'
import { Section } from './shared'

const PAYROLL_MIN = 5_000
const PAYROLL_MAX = 2_000_000
const STEPS = 1000

/** Logarithmic slider position <-> payroll amount, rounded to readable steps. */
function payrollFromPos(pos: number): number {
  const raw = PAYROLL_MIN * Math.pow(PAYROLL_MAX / PAYROLL_MIN, pos / STEPS)
  const step = raw < 100_000 ? 1_000 : raw < 1_000_000 ? 5_000 : 10_000
  return Math.min(PAYROLL_MAX, Math.max(PAYROLL_MIN, Math.round(raw / step) * step))
}
function posFromPayroll(v: number): number {
  return Math.round((Math.log(v / PAYROLL_MIN) / Math.log(PAYROLL_MAX / PAYROLL_MIN)) * STEPS)
}

function Slider({
  label,
  hint,
  value,
  display,
  valueText,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  hint: string
  value: number
  display: string
  valueText?: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  const id = useId()
  return (
    <div className="border-b border-border-subtle py-5 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[14px] font-medium text-text-primary">
          {label}
        </label>
        <output htmlFor={id} className="num text-[18px] text-text-primary">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText ?? display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-6 w-full cursor-pointer accent-brand-500 focus-ring rounded-[4px]"
      />
      <p className="mt-1 text-[12.5px] text-text-muted">{hint}</p>
    </div>
  )
}

/** Render a provider note with bare URLs turned into links. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s,]+)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noreferrer"
            className="[overflow-wrap:anywhere] rounded-[2px] underline decoration-border underline-offset-2 hover:text-text-primary focus-ring"
          >
            {p.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

export function Calculator() {
  const [contractors, setContractors] = useState(25)
  // Keep the raw slider position so arrow keys always move; the amount is derived and rounded.
  const [payrollPos, setPayrollPos] = useState(() => posFromPayroll(120_000))
  const payroll = payrollFromPos(payrollPos)
  const [idle, setIdle] = useState(400_000)

  const rows = useMemo(
    () => estimateAnnualCost({ monthlyPayroll: payroll, contractors, idleBalance: idle }),
    [payroll, contractors, idle],
  )
  const zeno = rows.find((r) => r.id === 'zeno')
  const others = rows.filter((r) => r.id !== 'zeno').sort((a, b) => a.net - b.net)
  const best = others[0]
  const settlement = Object.fromEntries(
    PROVIDERS.map((p) => [p.id, p.settlement.replace(/\s*\(illustrative\)/, '')]),
  )

  let summary = ''
  if (zeno && best) {
    const diff = Math.abs(best.net - zeno.net)
    if (zeno.net > best.net) {
      summary = `At these inputs ${best.name} models ${formatUSD(diff)} a year cheaper than Zeno. Flat per-contract pricing wins when payments are few and large.`
    } else if (zeno.net < 0) {
      summary = `Modeled yield on idle cash exceeds Zeno's fees by ${formatUSD(-zeno.net)} a year. The next lowest, ${best.name}, costs ${formatUSD(best.net)}.`
    } else {
      summary = `Zeno models at ${formatUSD(zeno.net)} a year net, ${formatUSD(diff)} less than ${best.name}, the next lowest.`
    }
  }

  return (
    <Section
      id="pricing"
      n="02"
      label="Pricing calculator"
      title="What a year of payroll costs."
      lead="Move the inputs to compare annual fees across providers. Zeno's column also credits simulated yield on the balance you keep idle."
      stacked
    >
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4">
          <Slider
            label="Contractors"
            hint="Paid once a month"
            value={contractors}
            display={String(contractors)}
            valueText={`${contractors} contractor${contractors === 1 ? '' : 's'}`}
            min={1}
            max={200}
            step={1}
            onChange={setContractors}
          />
          <Slider
            label="Monthly payroll"
            hint="Total sent per month, $5k to $2M"
            value={payrollPos}
            display={formatUSD(payroll)}
            valueText={`${formatUSD(payroll)} per month`}
            min={0}
            max={STEPS}
            step={1}
            onChange={setPayrollPos}
          />
          <Slider
            label="Idle balance"
            hint={`Held between runs, earning an assumed ${(ASSUMED_APY * 100).toFixed(1)}% APY`}
            value={idle}
            display={formatUSD(idle)}
            valueText={`${formatUSD(idle)} idle balance`}
            min={0}
            max={5_000_000}
            step={25_000}
            onChange={setIdle}
          />
        </div>

        <div className="min-w-0 lg:col-span-8">
          <p
            className="font-display text-[21px] leading-[1.35] text-text-primary"
            aria-live="polite"
          >
            {summary}
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-[14px]">
              <caption className="sr-only">Estimated annual cost by provider</caption>
              <thead>
                <tr className="border-b border-border text-left text-[12px] text-text-muted">
                  <th scope="col" className="pb-2.5 font-normal">
                    Provider
                  </th>
                  <th scope="col" className="hidden pb-2.5 font-normal sm:table-cell">
                    Settlement
                  </th>
                  <th scope="col" className="pb-2.5 text-right font-normal">
                    Fees / yr
                  </th>
                  <th
                    scope="col"
                    className="hidden pb-2.5 text-right font-normal min-[480px]:table-cell"
                  >
                    Yield / yr
                  </th>
                  <th scope="col" className="pb-2.5 text-right font-normal">
                    Net / yr
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-b border-border-subtle">
                    <th scope="row" className="py-3 pr-3 text-left font-medium text-text-primary">
                      {r.name}
                      <sup className="num ml-0.5 text-[10px] font-normal text-text-muted">
                        {i + 1}
                      </sup>
                    </th>
                    <td className="hidden py-3 pr-3 text-[13px] text-text-secondary sm:table-cell">
                      {settlement[r.id]}
                    </td>
                    <td className="num py-3 text-right text-text-primary">
                      {formatUSD(r.annualFees)}
                    </td>
                    <td
                      className={`num hidden py-3 text-right min-[480px]:table-cell ${r.yieldEarned > 0 ? 'text-positive' : 'text-text-muted'}`}
                    >
                      {r.yieldEarned > 0 ? formatUSD(r.yieldEarned, { sign: true }) : '—'}
                    </td>
                    <td
                      className={`num py-3 text-right font-medium ${r.net < 0 ? 'text-positive' : 'text-text-primary'}`}
                    >
                      {r.net < 0 ? `${formatUSD(-r.net)} gain` : formatUSD(r.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12.5px] text-text-muted">
            Net = fees minus yield. When modeled yield exceeds fees, net is shown as a gain.
            Illustrative. Not a quote.
          </p>
          <ol className="mt-6 space-y-2 border-t border-border-subtle pt-4 text-[12px] leading-[1.55] text-text-muted">
            {PROVIDERS.map((p, i) => (
              <li key={p.id} className="flex gap-2">
                <span className="num shrink-0">{i + 1}</span>
                <span>
                  <span className="text-text-secondary">{p.name}.</span> <Linkified text={p.note} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}
