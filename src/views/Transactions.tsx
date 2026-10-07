import { useMemo, useState } from 'react'
import { Card, Button } from '../components/UI'
import { useApp, formatActivityDate } from '../context/AppContext'
import { archiveActivity } from '../data'
import type { Activity, ActivityType } from '../data'
import { IconDownload } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { ActivityIcon } from '../components/ActivityIcon'
import { downloadCsv } from '../lib/csv'
import { formatUSD } from '../lib/money'

const FILTERS: ('All' | ActivityType)[] = [
  'All',
  'Payroll',
  'Yield',
  'Deposit',
  'Withdrawal',
  'Swap',
]

/** Activity dates are short strings ("Mar 5") unless createdAt is set; resolve to a timestamp. */
function timestamp(a: Activity, now: number): number {
  if (a.createdAt) return a.createdAt
  const year = new Date(now).getFullYear()
  const at = (y: number) => new Date(`${a.date} ${y} 00:00`).getTime()
  const parsed = at(year)
  if (Number.isNaN(parsed)) return 0
  // A transaction cannot be dated after today: a future date belongs to the previous year.
  return parsed > now ? at(year - 1) : parsed
}

export function Transactions() {
  const { toast, activity } = useApp()
  const [filter, setFilter] = useState<'All' | ActivityType>('All')
  const [query, setQuery] = useState('')

  const all = useMemo(() => {
    const now = Date.now()
    const seen = new Set<string>()
    return [...activity, ...archiveActivity]
      .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
      .map((t, i) => ({ t, ts: timestamp(t, now), i }))
      .sort((a, b) => b.ts - a.ts || a.i - b.i)
  }, [activity])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(
      ({ t }) =>
        (filter === 'All' || t.type === filter) &&
        (!q || `${t.type} ${t.detail}`.toLowerCase().includes(q)),
    )
  }, [all, filter, query])

  const groups = useMemo(() => {
    const out: { key: string; label: string; items: typeof visible; net: number }[] = []
    for (const row of visible) {
      const d = new Date(row.ts)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      let g = out[out.length - 1]
      if (!g || g.key !== key) {
        g = {
          key,
          label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          items: [],
          net: 0,
        }
        out.push(g)
      }
      g.items.push(row)
      g.net += row.t.amount
    }
    return out
  }, [visible])

  const exportCsv = () => {
    downloadCsv(`zeno-transactions-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Type', 'Detail', 'Amount (USD)', 'Date'],
      ...visible.map(({ t }) => [t.type, t.detail, t.amount.toFixed(2), formatActivityDate(t)]),
    ])
    toast(`Exported ${visible.length} transactions`, 'green')
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Transactions">
        <Button variant="secondary" onClick={exportCsv} disabled={visible.length === 0}>
          <IconDownload width={14} height={14} /> Export CSV
        </Button>
      </TopBar>
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-7">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`h-8 rounded-[6px] border px-3 text-[13px] font-medium transition-colors focus-ring ${
                  filter === f
                    ? 'border-brand-500/40 bg-brand-50 text-brand-500'
                    : 'border-border bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="w-full lg:w-72">
            <label htmlFor="tx-search" className="sr-only">
              Search transactions
            </label>
            <input
              id="tx-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search detail or type"
              className="h-9 w-full rounded-[6px] border border-border bg-bg-surface px-3 text-[13.5px] text-text-primary placeholder:text-text-muted focus-ring"
            />
          </div>
        </div>

        {groups.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <p className="font-display text-[20px] text-text-primary">No transactions found</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-text-secondary">
              Nothing matches the current filter. Clear the search or choose another type.
            </p>
            <Button
              variant="secondary"
              className="mt-5"
              onClick={() => {
                setFilter('All')
                setQuery('')
              }}
            >
              Clear filters
            </Button>
          </Card>
        ) : (
          <Card>
            {groups.map((g) => (
              <section key={g.key} aria-label={g.label}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-bg-elevated px-5 py-2 first:rounded-t-[10px]">
                  <h2 className="eyebrow">{g.label}</h2>
                  <span className="num text-[12px] text-text-secondary">
                    Net {formatUSD(g.net, { sign: true })}
                  </span>
                </div>
                <ul>
                  {g.items.map(({ t }) => (
                    <li
                      key={t.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3.5 border-b border-border-subtle px-5 py-3 last:border-b-0 hover:bg-bg-elevated sm:grid-cols-[auto_1fr_7rem_6rem]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-bg-inset text-text-secondary ring-1 ring-inset ring-border-subtle">
                        <ActivityIcon type={t.type} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] text-text-primary">{t.detail}</div>
                        <div className="text-[12px] text-text-muted">
                          {t.type}
                          <span className="sm:hidden"> · {formatActivityDate(t)}</span>
                        </div>
                      </div>
                      <div
                        className={`num text-right text-[13.5px] ${t.amount >= 0 ? 'text-positive' : 'text-text-primary'}`}
                      >
                        {t.amount >= 0 ? '+' : '−'}
                        {formatUSD(Math.abs(t.amount))}
                      </div>
                      <div className="hidden text-right text-[12.5px] text-text-muted sm:block">
                        {formatActivityDate(t)}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </Card>
        )}
        <p className="mt-4 text-[12.5px] text-text-muted">
          Showing {visible.length} of {all.length} transactions.
        </p>
      </div>
    </div>
  )
}
