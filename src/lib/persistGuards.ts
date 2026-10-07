import type { Activity, ActivityType, Member, Method, PayrollRecipient, PayrollRun } from '../data'

/** Upper bound on the serialized size of persisted state (UTF-8 bytes). */
export const MAX_STATE_BYTES = 1_000_000
/** Upper bound on the length of any persisted collection. */
export const MAX_ITEMS = 5000
export const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

const DEFAULT_MAX_STRING = 256
const MAX_DETAIL = 1024

const METHODS: readonly Method[] = ['USDC', 'USDT', 'EUR Bank']
const ACTIVITY_TYPES: readonly ActivityType[] = [
  'Payroll',
  'Yield',
  'Deposit',
  'Swap',
  'Withdrawal',
]

export const isMethod = (x: unknown): x is Method =>
  typeof x === 'string' && (METHODS as readonly string[]).includes(x)
export const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)
export const isFiniteNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

export const isSafeString = (x: unknown, max: number = DEFAULT_MAX_STRING): x is string =>
  typeof x === 'string' && x.length <= max

export const isEvmAddress = (x: unknown): x is string =>
  typeof x === 'string' && EVM_ADDRESS_RE.test(x)

const isBoundedArray = (x: unknown): x is unknown[] => Array.isArray(x) && x.length <= MAX_ITEMS

export const isPayrollRecipient = (x: unknown): x is PayrollRecipient =>
  isObj(x) &&
  typeof x.memberId === 'string' &&
  typeof x.name === 'string' &&
  isMethod(x.method) &&
  isFiniteNum(x.amount) &&
  typeof x.txHash === 'string' &&
  (x.status === 'sent' || x.status === 'failed')

export const isPayrollRun = (x: unknown): x is PayrollRun =>
  isObj(x) &&
  typeof x.id === 'string' &&
  typeof x.clientRunId === 'string' &&
  isFiniteNum(x.createdAt) &&
  isFiniteNum(x.total) &&
  isFiniteNum(x.fee) &&
  isBoundedArray(x.recipients) &&
  x.recipients.every(isPayrollRecipient)

export const isMember = (x: unknown): x is Member =>
  isObj(x) &&
  isSafeString(x.id) &&
  isSafeString(x.name) &&
  isSafeString(x.role) &&
  isSafeString(x.country) &&
  isSafeString(x.countryCode) &&
  isMethod(x.method) &&
  isFiniteNum(x.amount) &&
  isSafeString(x.initials) &&
  isSafeString(x.avatarColor) &&
  (x.wallet === undefined || isEvmAddress(x.wallet)) &&
  (x.email === undefined || isSafeString(x.email))

export const isActivity = (x: unknown): x is Activity =>
  isObj(x) &&
  isSafeString(x.id) &&
  typeof x.type === 'string' &&
  (ACTIVITY_TYPES as readonly string[]).includes(x.type) &&
  isSafeString(x.detail, MAX_DETAIL) &&
  isSafeString(x.date) &&
  isFiniteNum(x.amount) &&
  (x.createdAt === undefined || isFiniteNum(x.createdAt))

export type Persisted = {
  team: Member[]
  activity: Activity[]
  payrollRuns: PayrollRun[]
  treasuryBalance: number
  treasuryYieldMtd: number
  defaultMethod: Method
}

export const isPersistedState = (x: unknown): x is Persisted =>
  isObj(x) &&
  isBoundedArray(x.team) &&
  x.team.every(isMember) &&
  isBoundedArray(x.activity) &&
  x.activity.every(isActivity) &&
  isBoundedArray(x.payrollRuns) &&
  x.payrollRuns.every(isPayrollRun) &&
  isFiniteNum(x.treasuryBalance) &&
  x.treasuryBalance >= 0 &&
  isFiniteNum(x.treasuryYieldMtd) &&
  isMethod(x.defaultMethod)

const FORBIDDEN_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype'])

// Drops prototype-pollution keys at every depth so they never reach consumers that merge objects.
const stripForbiddenKeys = (key: string, value: unknown): unknown =>
  FORBIDDEN_KEYS.has(key) ? undefined : value

const utf8ByteLength = (s: string): number => new TextEncoder().encode(s).length

/**
 * Parses and validates raw persisted state. Returns null when the input is missing,
 * exceeds MAX_STATE_BYTES, is not valid JSON, or does not match the persisted shape.
 */
export function parsePersisted(raw: string | null): Persisted | null {
  if (raw === null) return null
  // UTF-8 byte length is always >= UTF-16 code-unit length, so this cheap check is a safe pre-filter.
  if (raw.length > MAX_STATE_BYTES || utf8ByteLength(raw) > MAX_STATE_BYTES) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw, stripForbiddenKeys)
  } catch {
    return null
  }
  if (!isPersistedState(parsed)) return null
  return {
    team: parsed.team,
    activity: parsed.activity,
    payrollRuns: parsed.payrollRuns,
    treasuryBalance: parsed.treasuryBalance,
    treasuryYieldMtd: parsed.treasuryYieldMtd,
    defaultMethod: parsed.defaultMethod,
  }
}
