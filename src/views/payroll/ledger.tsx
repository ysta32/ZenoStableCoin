import type { Member, PayrollRun } from '../../data'
import { downloadCsv } from '../../lib/csv'
import { formatUSD } from '../../lib/money'

export const FEE_RATE = 0.002
export const MAX_AMOUNT = 1_000_000

/** Shift a number's decimal point by `places` via its string form, avoiding binary multiply error. */
function shiftDecimal(n: number, places: number): number {
  const [mantissa, exp = '0'] = String(n).split('e')
  return Number(`${mantissa}e${Number(exp) + places}`)
}

/**
 * Round to cents, half away from zero, using decimal (string) shifting so ties like
 * 1.005 and 10.075 round up as written. Handles negatives and exponent-form input.
 */
export function round2(n: number): number {
  if (!Number.isFinite(n)) return n
  const sign = n < 0 ? -1 : 1
  const result = shiftDecimal(Math.round(shiftDecimal(Math.abs(n), 2)), -2)
  return result === 0 ? 0 : sign * result
}

/** Normalize a USD amount to whole cents; non-finite input becomes 0. */
export const toCents = (n: number) => (Number.isFinite(n) ? round2(n) : 0)

/** Sum of cent-normalized amounts, so a total always equals the sum of its displayed rows. */
export const sumCents = (amounts: number[]) => round2(amounts.reduce((s, a) => s + toCents(a), 0))

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
  return amountError(toCents(m.amount))
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
    ...run.recipients.map((r) => [run.id, date, r.name, r.method, toCents(r.amount).toFixed(2), r.status, r.txHash]),
    [run.id, date, 'Network fee (0.2%)', '', run.fee.toFixed(2), '', ''],
    [run.id, date, 'Total debited', '', round2(run.total + run.fee).toFixed(2), '', ''],
  ]
  downloadCsv(`zeno-payroll-receipt-${date.slice(0, 10)}-${run.id}.csv`, rows)
}
