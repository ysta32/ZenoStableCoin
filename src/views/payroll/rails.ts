import type { Method } from '../../data'
import { formatUSD } from '../../lib/money'
import { toCents } from './ledger'

export type RailCode = 'INSUFFICIENT_BALANCE' | 'NO_RECIPIENTS' | 'ZERO_AMOUNT' | 'DUPLICATE_WALLET' | 'MISSING_WALLET'

export type Rail = { code: RailCode; message: string; memberIds?: string[] }

export type RailsResult = { blockers: Rail[]; warnings: Rail[] }

export type RailsRecipient = { memberId: string; name: string; method: Method; amount: number; wallet?: string }

export type RailsInput = { recipients: RailsRecipient[]; total: number; fee: number; balance: number }

const ONCHAIN_METHODS: readonly Method[] = ['USDC', 'USDT']

/** Whole integer cents for a USD amount (non-finite input is 0), so comparisons never see float noise. */
export function centsInt(n: number): number {
  return Math.round(toCents(n) * 100)
}

const usd = (cents: number) => formatUSD(cents / 100, { cents: true })

const displayName = (r: RailsRecipient) => r.name.trim() || 'Unnamed'

function listNames(rs: RailsRecipient[]): string {
  const names = rs.map(displayName)
  if (names.length <= 2) return names.join(' and ')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/** Pre-execution safety rails for a payroll run. Blockers prevent execution; warnings only inform. */
export function checkRun(input: RailsInput): RailsResult {
  const { recipients } = input
  const blockers: Rail[] = []
  const warnings: Rail[] = []

  if (recipients.length === 0) {
    blockers.push({ code: 'NO_RECIPIENTS', message: 'There are no recipients in this run.' })
  }

  const debitCents = centsInt(input.total) + centsInt(input.fee)
  const balanceCents = centsInt(input.balance)
  if (debitCents > balanceCents) {
    blockers.push({
      code: 'INSUFFICIENT_BALANCE',
      message: `Treasury balance of ${usd(balanceCents)} does not cover the ${usd(debitCents)} debit. Deposit ${usd(debitCents - balanceCents)} or reduce amounts.`,
    })
  }

  const missing = recipients.filter((r) => ONCHAIN_METHODS.includes(r.method) && !r.wallet?.trim())
  if (missing.length > 0) {
    blockers.push({
      code: 'MISSING_WALLET',
      message: `${listNames(missing)} ${plural(missing.length, 'is', 'are')} paid in stablecoin but ${plural(missing.length, 'has', 'have')} no wallet address.`,
      memberIds: missing.map((r) => r.memberId),
    })
  }

  const zero = recipients.filter((r) => centsInt(r.amount) === 0)
  if (zero.length > 0) {
    warnings.push({
      code: 'ZERO_AMOUNT',
      message: `${listNames(zero)} ${plural(zero.length, 'has', 'have')} a $0.00 amount.`,
      memberIds: zero.map((r) => r.memberId),
    })
  }

  const byWallet = new Map<string, RailsRecipient[]>()
  for (const r of recipients) {
    const key = r.wallet?.trim().toLowerCase()
    if (!key) continue
    const group = byWallet.get(key)
    if (group) group.push(r)
    else byWallet.set(key, [r])
  }
  for (const group of byWallet.values()) {
    if (group.length < 2) continue
    const wallet = group[0].wallet?.trim() ?? ''
    const short = wallet.length > 14 ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : wallet
    warnings.push({
      code: 'DUPLICATE_WALLET',
      message: `${listNames(group)} share the wallet ${short}.`,
      memberIds: group.map((r) => r.memberId),
    })
  }

  return { blockers, warnings }
}

/** The total exactly as displayed (grouped, two decimals), without the currency symbol. */
export function confirmationPhrase(total: number): string {
  return formatUSD(total, { cents: true }).replace('$', '')
}

const normalize = (s: string) => s.trim().replace(/^\$/, '').trim().replace(/,/g, '').toLowerCase()

/** True when the typed text is the confirmation phrase, ignoring surrounding space, commas, a leading $ and case. */
export function matchesConfirmation(input: string, total: number): boolean {
  if (!Number.isFinite(total)) return false
  const typed = normalize(input)
  return typed.length > 0 && typed === normalize(confirmationPhrase(total))
}
