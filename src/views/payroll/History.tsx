import { useState } from 'react'
import { Card, MethodBadge, Pill } from '../../components/UI'
import { IconChevronDown, IconDownload } from '../../components/Icons'
import { useApp } from '../../context/AppContext'
import type { PayrollRun } from '../../data'
import { downloadReceipt, formatRunDate, round2, shortHash, usd } from './ledger'

export function History() {
  const { payrollRuns } = useApp()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <section className="mt-10" aria-labelledby="past-runs-title">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="past-runs-title" className="font-display text-[22px] leading-tight text-text-primary">
          Past runs
        </h2>
        {payrollRuns.length > 0 && (
          <span className="text-[12.5px] text-text-muted">
            <span className="num">{payrollRuns.length}</span> run{payrollRuns.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <Card className="overflow-hidden">
        {payrollRuns.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13.5px] text-text-secondary">
            Completed payroll runs and their receipts will appear here.
          </p>
        ) : (
          <ul>
            {payrollRuns.map((run) => (
              <RunRow
                key={run.id}
                run={run}
                expanded={open === run.id}
                onToggle={() => setOpen((v) => (v === run.id ? null : run.id))}
              />
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}

function RunRow({ run, expanded, onToggle }: { run: PayrollRun; expanded: boolean; onToggle: () => void }) {
  const panelId = `run-panel-${run.id}`
  const n = run.recipients.length
  const failed = run.recipients.filter((r) => r.status === 'failed').length
  return (
    <li className="border-b border-border-subtle last:border-b-0">
      <div className="flex items-center gap-2 pr-3 sm:pr-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="focus-ring flex min-h-[52px] min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated sm:px-5"
        >
          <IconChevronDown
            width={14}
            height={14}
            aria-hidden="true"
            className={`shrink-0 text-text-muted transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-medium text-text-primary">{formatRunDate(run.createdAt)}</span>
            <span className="block truncate text-[12px] text-text-muted">
              {n} recipient{n === 1 ? '' : 's'} · fee <span className="num">{usd(run.fee)}</span>
            </span>
          </span>
          <span className="hidden sm:inline-flex">
            {failed > 0 ? <Pill tone="negative">{failed} failed</Pill> : <Pill tone="positive">Settled</Pill>}
          </span>
          <span className="num shrink-0 text-right text-[13.5px] text-text-primary sm:w-28">{usd(round2(run.total + run.fee))}</span>
        </button>
        <button
          type="button"
          onClick={() => downloadReceipt(run)}
          aria-label={`Download receipt for run on ${formatRunDate(run.createdAt)}`}
          title="Download receipt (CSV)"
          className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-text-muted hover:bg-bg-inset hover:text-text-primary"
        >
          <IconDownload width={14} height={14} />
        </button>
      </div>
      {expanded && (
        <div id={panelId} className="border-t border-border-subtle bg-bg-elevated px-4 py-2 sm:px-5">
          <ul className="divide-y divide-border-subtle">
            {run.recipients.map((r, i) => (
              <li key={`${r.memberId}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                <span className="min-w-0 basis-full truncate text-[13px] text-text-primary sm:basis-auto sm:flex-1">{r.name || 'Unnamed'}</span>
                <MethodBadge method={r.method} />
                <span className="font-mono tabular-nums text-[12px] text-text-muted" title={r.txHash}>
                  {shortHash(r.txHash)}
                </span>
                <span className="num ml-auto w-24 text-right text-[13px] text-text-primary">{usd(r.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="py-2 text-[12px] text-text-muted">
            Run <span className="font-mono tabular-nums">{run.id}</span>
          </p>
        </div>
      )}
    </li>
  )
}
