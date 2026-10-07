import { KeyboardEvent, ReactNode, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { LICopy, Section } from './shared'

const REQUEST = `// Illustrative API — not live in this prototype
const run = await fetch('https://api.zeno.example/v1/payroll_runs', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.ZENO_API_KEY}\`,
    'Idempotency-Key': 'payroll-2026-10',
  },
  body: JSON.stringify({
    source: 'treasury_usdc',
    recipients: [
      { contractor: 'ctr_ana_silva', amount: '4200.00', method: 'USDC' },
      { contractor: 'ctr_lea_martin', amount: '6500.00', method: 'EUR_BANK' },
    ],
  }),
})`

const WEBHOOK = `{
  "id": "evt_01J9Z3QK",
  "type": "payroll_run.settled",
  "created": 1793491200,
  "data": {
    "run_id": "run_01J9Z2MB",
    "recipients": 5,
    "total": "25600.00",
    "fee": "51.20",
    "currency": "USDC",
    "failed": []
  }
}`

const TABS = [
  { id: 'request', label: 'Create a run', file: 'create-run.ts', code: REQUEST },
  { id: 'webhook', label: 'Webhook event', file: 'payroll_run.settled.json', code: WEBHOOK },
] as const

const TOKEN =
  /(\/\/.*$)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)(\s*:)?|\b(\d+(?:\.\d+)?)\b|\b(const|await|true|false|null)\b|([A-Za-z_$][\w$]*)(?=\s*:)/gm

/** Tiny highlighter for the two fixed snippets above; not a general parser. */
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0
    if (start > last) out.push(code.slice(last, start))
    const [whole, comment, str, colon, num, kw, key] = m
    if (comment)
      out.push(
        <span key={k++} className="italic text-text-muted">
          {comment}
        </span>,
      )
    else if (str && colon) {
      out.push(
        <span key={k++} className="text-text-primary">
          {str}
        </span>,
        colon,
      )
    } else if (str)
      out.push(
        <span key={k++} className="text-brand-500">
          {str}
        </span>,
      )
    else if (num)
      out.push(
        <span key={k++} className="text-warning">
          {num}
        </span>,
      )
    else if (kw)
      out.push(
        <span key={k++} className="text-info-500">
          {kw}
        </span>,
      )
    else if (key)
      out.push(
        <span key={k++} className="text-text-primary">
          {key}
        </span>,
      )
    else out.push(whole)
    last = start + whole.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

const ENDPOINTS: [string, string, string][] = [
  ['POST', '/v1/payroll_runs', 'Create and submit a run'],
  ['GET', '/v1/payroll_runs/:id', 'Status per recipient'],
  ['POST', '/v1/contractors', 'Add a payee and method'],
  ['EVENT', 'payroll_run.settled', 'Sent when every payment lands'],
]

export function Developers() {
  const { toast } = useApp()
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tab = TABS[active]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tab.code)
      toast('Copied to clipboard')
    } catch {
      toast('Could not copy. Select the code and copy it manually.', 'amber')
    }
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <Section
      id="developers"
      n="04"
      label="Developers"
      title="A small API shaped like your payroll."
      lead={
        <>
          The prototype has no public API yet. This is the interface we are designing toward:
          idempotent runs, one object per payment, and a webhook when a run settles.
        </>
      }
    >
      <div className="grid gap-8 xl:gap-10">
        <div className="overflow-hidden rounded-[10px] border border-border-subtle bg-bg-inset">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface pl-2 pr-2">
            <div role="tablist" aria-label="Code examples" className="flex">
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={i === active}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={onTabKey}
                  className={`relative h-11 px-3 text-[13px] transition-colors focus-ring rounded-[4px] ${
                    i === active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {t.label}
                  {i === active && (
                    <span className="absolute inset-x-3 bottom-0 h-px bg-text-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums hidden text-[11.5px] text-text-muted sm:inline">
                {tab.file}
              </span>
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy ${tab.label.toLowerCase()} example`}
                className="inline-flex h-9 items-center gap-1.5 rounded-[6px] px-2.5 text-[12.5px] text-text-secondary transition-colors hover:bg-text-primary/[0.05] hover:text-text-primary focus-ring"
              >
                <LICopy />
                Copy
              </button>
            </div>
          </div>
          <div
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            tabIndex={0}
            className="focus-ring"
          >
            <pre className="font-mono tabular-nums overflow-x-auto px-5 py-5 text-[12.5px] leading-[1.75] text-text-secondary">
              <code>{highlight(tab.code)}</code>
            </pre>
          </div>
        </div>

        <dl className="grid border-t border-border-subtle sm:grid-cols-2">
          {ENDPOINTS.map(([verb, path, desc], i) => (
            <div
              key={path}
              className={`flex flex-col gap-1 border-b border-border-subtle py-4 ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : 'sm:pr-6'}`}
            >
              <dt className="font-mono tabular-nums flex items-baseline gap-2.5 text-[13px]">
                <span className="w-[42px] text-[11px] text-text-muted">{verb}</span>
                <span className="text-text-primary">{path}</span>
              </dt>
              <dd className="pl-[52px] text-[13.5px] text-text-secondary">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}
