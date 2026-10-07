import type { Member, PayrollRun } from '../../data'
import { downloadCsv } from '../../lib/csv'
import { formatUSD } from '../../lib/money'

export const FEE_RATE = 0.002
export const MAX_AMOUNT = 1_000_000

export const round2 = (n: number) => Math.round(n * 100) / 100

export function feeFor(subtotal: number): number {
  return round2(subtotal * FEE_RATE)
}

export const usd = (n: number) => formatUSD(n, { cents: true })

/** Returns a human-readable problem with an amount, or null when it is payable. */
export function amountError(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return 'Enter an amount above $0'
  if (amount > MAX_AMOUNT) return `Maximum is ${formatUSD(MAX_AMOUNT)} per recipient`
  return null
}

/** Row-level validation used by the amounts step and to gate review. */
export function memberError(m: Member): string | null {
  if (!m.name.trim()) return 'Add a name'
  return amountError(m.amount)
}

export function shortHash(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash
}

export function newClientRunId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `cr_${rand}`
}

export function formatRunDate(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function downloadReceipt(run: PayrollRun): void {
  const date = new Date(run.createdAt).toISOString()
  const rows: (string | number)[][] = [
    ['run_id', 'date', 'recipient', 'method', 'amount_usd', 'status', 'tx_hash'],
    ...run.recipients.map((r) => [run.id, date, r.name, r.method, r.amount.toFixed(2), r.status, r.txHash]),
    [run.id, date, 'Network fee (0.2%)', '', run.fee.toFixed(2), '', ''],
    [run.id, date, 'Total debited', '', round2(run.total + run.fee).toFixed(2), '', ''],
  ]
  downloadCsv(`zeno-payroll-receipt-${date.slice(0, 10)}-${run.id}.csv`, rows)
}
