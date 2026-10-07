import { useMemo } from 'react'
import { Card, Button, Pill } from '../components/UI'
import { useApp } from '../context/AppContext'
import { IconDownload } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { downloadCsv } from '../lib/csv'

type Report = {
  id: string
  name: string
  kind: string
  description: string
  period: string
  ready: boolean
  onDownload: () => void
}

export function Reports() {
  const { team, activity, toast } = useApp()

  const period = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const monthLong = now.toLocaleDateString('en-US', { month: 'long' })
    const monthShort = now.toLocaleDateString('en-US', { month: 'short' })
    const eom = new Date(year, now.getMonth() + 1, 0).getDate()
    const monthRange = `${monthShort} 1 – ${monthShort} ${eom}, ${year}`

    const q = Math.floor(now.getMonth() / 3)
    const lastQ = q === 0 ? 3 : q - 1
    const lastQYear = q === 0 ? year - 1 : year
    const qStartMonth = lastQ * 3
    const qEnd = new Date(lastQYear, qStartMonth + 3, 0)
    const qShort = ['Q1', 'Q2', 'Q3', 'Q4'][lastQ]
    const startName = new Date(lastQYear, qStartMonth, 1).toLocaleDateString('en-US', { month: 'short' })
    const endName = qEnd.toLocaleDateString('en-US', { month: 'short' })
    const qRange = `${startName} 1 – ${endName} ${qEnd.getDate()}, ${lastQYear}`
    return {
      year,
      monthLong,
      monthRange,
      qLabel: `${qShort} ${lastQYear}`,
      qRange,
      qFile: `${qShort.toLowerCase()}-${lastQYear}`,
      monthFile: monthLong.toLowerCase(),
    }
  }, [])

  const download = (filename: string, rows: (string | number)[][]) => {
    downloadCsv(filename, rows)
    toast(`${filename} downloaded`, 'green')
  }

  const summary: Report[] = [
    {
      id: 'pl-q',
      name: `${period.qLabel} profit and loss`,
      kind: 'Summary',
      description: 'Inflows, outflows, treasury yield and net position for the quarter.',
      period: period.qRange,
      ready: true,
      onDownload: () => {
        const inSum = activity.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
        const outSum = activity.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
        const yieldSum = activity.filter((t) => t.type === 'Yield').reduce((s, t) => s + t.amount, 0)
        download(`zeno-pl-${period.qFile}.csv`, [
          ['Metric', 'Value (USD)'],
          ['Total inflows', inSum.toFixed(2)],
          ['Total outflows', outSum.toFixed(2)],
          ['Treasury yield', yieldSum.toFixed(2)],
          ['Net', (inSum - outSum).toFixed(2)],
        ])
      },
    },
    {
      id: 'treasury-stmt',
      name: `Treasury statement, ${period.monthLong}`,
      kind: 'Statement',
      description: 'Every treasury movement with date, type, detail and amount.',
      period: period.monthRange,
      ready: true,
      onDownload: () =>
        download(`zeno-treasury-${period.monthFile}-${period.year}.csv`, [
          ['Date', 'Type', 'Detail', 'Amount (USD)'],
          ...activity.map((t) => [t.date, t.type, t.detail, t.amount.toFixed(2)]),
        ]),
    },
    {
      id: 'country-tax-br',
      name: 'Brazil contractor tax filing',
      kind: 'Country form',
      description: 'Local filing for contractors paid in Brazil.',
      period: period.qLabel,
      ready: false,
      onDownload: () => toast('Brazil filing is not available in this demo yet'),
    },
    {
      id: 'country-tax-in',
      name: 'India contractor tax filing',
      kind: 'Country form',
      description: 'Local filing for contractors paid in India.',
      period: period.qLabel,
      ready: false,
      onDownload: () => toast('India filing is not available in this demo yet'),
    },
  ]

  const forms: Report[] = team.map((m) => ({
    id: `1099-${m.id}`,
    name: m.name || 'Unnamed',
    kind: '1099-NEC',
    description: `${m.role} · ${m.country}`,
    period: `Tax year ${period.year}`,
    ready: true,
    onDownload: () =>
      download(`1099-${(m.name || 'unnamed').replace(/\s+/g, '-').toLowerCase()}-${period.year}.csv`, [
        ['Form', 'Recipient', 'Country', 'Method', 'YTD Payments (USD)', 'Tax year'],
        ['1099-NEC', m.name || 'Unnamed', m.country, m.method, (m.amount * 4).toFixed(2), period.year],
      ]),
  }))

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Reports" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-7">
        <p className="mb-6 max-w-xl text-[14px] text-text-secondary">
          Generated from your payroll and treasury activity. Each report downloads as a CSV.
        </p>
        <ReportGroup title="Financial summaries" rows={summary} />
        <ReportGroup title={`Contractor tax forms, ${period.year}`} rows={forms} empty="Add contractors to generate their 1099-NEC forms." />
      </div>
    </div>
  )
}

function ReportGroup({ title, rows, empty }: { title: string; rows: Report[]; empty?: string }) {
  return (
    <section className="mb-8" aria-label={title}>
      <h2 className="mb-2.5 text-[15px] font-semibold text-text-primary">{title}</h2>
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13.5px] text-text-secondary">{empty}</p>
        ) : (
          <ul>
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0 hover:bg-bg-elevated sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium text-text-primary">{r.name}</span>
                    <Pill tone="neutral">{r.kind}</Pill>
                  </div>
                  <p className="mt-1 text-[13px] text-text-secondary">{r.description}</p>
                  <p className="num mt-0.5 text-[12px] text-text-muted">{r.period}</p>
                </div>
                {r.ready ? (
                  <Button variant="secondary" size="sm" onClick={r.onDownload}>
                    <IconDownload width={12} height={12} /> Download CSV
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={r.onDownload}>
                    <Pill tone="warning">Coming soon</Pill>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
