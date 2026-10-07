import { useEffect, useState } from 'react'
import { Avatar, Button, Card, Pill } from '../../components/UI'
import { IconCheck, IconDownload, IconSpinner } from '../../components/Icons'
import { useApp } from '../../context/AppContext'
import type { PayrollRecipient, PayrollRun } from '../../data'
import { downloadReceipt, formatRunDate, shortHash, usd } from './ledger'
import { TotalsLedger } from './TotalsLedger'

/** Compressed on-screen duration of the settlement walkthrough. */
const DURATION_MS = 6200
/** Real-world seconds the walkthrough represents. */
const REAL_SECONDS = 28

const STAGES = [
  { label: 'Validate payroll data and FX rates', at: 0 },
  { label: 'Run compliance checks', at: 2 },
  { label: 'Mint stablecoins from treasury', at: 5 },
  { label: 'Distribute to recipients', at: 8 },
] as const

type RowState = 'pending' | 'processing' | PayrollRecipient['status']

function rowState(i: number, n: number, elapsedMs: number, final: PayrollRecipient['status']): RowState {
  const distStart = (STAGES[3].at / REAL_SECONDS) * DURATION_MS
  const span = DURATION_MS - distStart
  const sentAt = distStart + ((i + 1) * span) / (n + 1)
  const procAt = sentAt - span / (n + 1) - 200
  if (elapsedMs >= sentAt) return final
  if (elapsedMs >= procAt) return 'processing'
  return 'pending'
}

export function StepExecute({
  run,
  onRestart,
  onFinished,
}: {
  run: PayrollRun | undefined
  onRestart: () => void
  onFinished: (runId: string | null) => void
}) {
  const { setView } = useApp()
  const [now, setNow] = useState(() => Date.now())
  const startedAt = run?.createdAt ?? 0
  const finished = !run || now - startedAt >= DURATION_MS

  // Progress is derived from the run's timestamp, so leaving and returning resumes, never replays.
  useEffect(() => {
    if (finished) return
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [finished])

  const runId = run?.id ?? null
  useEffect(() => {
    if (finished) onFinished(runId)
  }, [finished, runId, onFinished])

  if (!run) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <h2 className="font-display text-[24px] text-text-primary">No run in progress</h2>
        <p className="mt-2 text-[13.5px] text-text-secondary">Start a new payroll run to continue.</p>
        <div className="mt-5">
          <Button variant="primary" onClick={onRestart}>
            Start a new run
          </Button>
        </div>
      </Card>
    )
  }

  const elapsed = Math.max(0, Math.min(DURATION_MS, now - startedAt))
  const frac = elapsed / DURATION_MS
  const seconds = finished ? REAL_SECONDS : Math.min(REAL_SECONDS - 1, Math.floor(frac * REAL_SECONDS))
  const stageIdx = STAGES.reduce((acc, s, i) => (seconds >= s.at ? i : acc), 0)
  const n = run.recipients.length
  const failed = run.recipients.filter((r) => r.status === 'failed').length

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="eyebrow">{finished ? 'Payroll sent' : 'Executing payroll'}</div>
            <div className="num mt-2 text-[32px] leading-none text-text-primary sm:text-[40px]">{usd(run.total)}</div>
            <p className="mt-2 text-[13.5px] text-text-secondary">
              {finished
                ? `Settled to ${n} recipient${n === 1 ? '' : 's'} in ${REAL_SECONDS} seconds.`
                : `Paying ${n} recipient${n === 1 ? '' : 's'}.`}
            </p>
          </div>
          <div className="sm:text-right">
            <div className="eyebrow">Elapsed</div>
            <div className="num mt-2 text-[22px] text-text-primary" aria-hidden="true">
              T+{seconds}s
            </div>
          </div>
        </div>

        <div
          className="mt-6 h-1 w-full overflow-hidden rounded-full bg-bg-inset"
          role="progressbar"
          aria-label="Payroll progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(frac * 100)}
        >
          <div className="h-full bg-brand-500 transition-[width] duration-100 ease-linear" style={{ width: `${frac * 100}%` }} />
        </div>

        <ol className="mt-5 grid gap-2 sm:grid-cols-2" aria-live="polite">
          {STAGES.map((s, i) => {
            const done = finished || i < stageIdx
            const active = !finished && i === stageIdx
            return (
              <li key={s.label} className="flex items-center gap-2.5 text-[13px]">
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-positive-soft text-positive' : 'bg-bg-inset text-text-muted'}`}
                >
                  {done ? (
                    <IconCheck width={12} height={12} />
                  ) : active ? (
                    <IconSpinner width={12} height={12} className="animate-spin" />
                  ) : (
                    <span className="num text-[10.5px]">{i + 1}</span>
                  )}
                </span>
                <span className={done || active ? 'text-text-primary' : 'text-text-muted'}>
                  {s.label}
                  {active && <span className="sr-only"> (in progress)</span>}
                </span>
              </li>
            )
          })}
        </ol>

        <ul className="mt-6 divide-y divide-border-subtle border-y border-border-subtle" aria-label="Recipient status">
          {run.recipients.map((r, i) => {
            const st = rowState(i, n, finished ? DURATION_MS : elapsed, r.status)
            const settled = st === 'sent' || st === 'failed'
            return (
              <li key={`${r.memberId}-${i}`} className="flex items-center gap-3 py-3">
                <Avatar initials={initialsOf(r.name)} color="" size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-text-primary">{r.name || 'Unnamed'}</div>
                  <div className="truncate text-[12px] text-text-muted">
                    {r.method}
                    {settled && (
                      <>
                        {' · '}
                        <span className="num" title={r.txHash}>
                          {shortHash(r.txHash)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="num hidden text-[13.5px] text-text-primary sm:inline">{usd(r.amount)}</span>
                <StatusPill state={st} />
              </li>
            )
          })}
        </ul>

        {finished && (
          <div className="mt-6">
            <div className="flex items-start gap-3 rounded-[10px] border border-border-subtle bg-bg-elevated p-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-positive-soft text-positive" aria-hidden="true">
                <IconCheck width={14} height={14} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[22px] leading-tight text-text-primary" role="status">
                  {failed === 0 ? 'Payroll complete' : `Payroll complete with ${failed} failed payment${failed === 1 ? '' : 's'}`}
                </h2>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Recorded {formatRunDate(run.createdAt)} · run <span className="num">{run.id}</span>. A receipt is recorded for{' '}
                  {n === 1 ? 'the payment' : `each of the ${n} payments`}.
                </p>
                <div className="mt-3 max-w-sm">
                  <TotalsLedger subtotal={run.total} fee={run.fee} recipients={n} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={() => downloadReceipt(run)}>
                <IconDownload width={14} height={14} /> Download receipt (CSV)
              </Button>
              <Button variant="secondary" onClick={() => setView('transactions')}>
                View transactions
              </Button>
              <Button variant="primary" onClick={onRestart}>
                Run another payroll
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'
  )
}

function StatusPill({ state }: { state: RowState }) {
  if (state === 'sent')
    return (
      <Pill tone="positive" className="min-w-[88px] justify-center">
        <IconCheck width={10} height={10} /> Sent
      </Pill>
    )
  if (state === 'failed')
    return (
      <Pill tone="negative" className="min-w-[88px] justify-center">
        Failed
      </Pill>
    )
  if (state === 'processing')
    return (
      <Pill tone="warning" className="min-w-[88px] justify-center">
        <IconSpinner width={10} height={10} className="animate-spin" /> Processing
      </Pill>
    )
  return (
    <Pill tone="neutral" className="min-w-[88px] justify-center">
      Pending
    </Pill>
  )
}
