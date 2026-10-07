import type { Method, PayrollRecipient, PayrollRun } from '../data'

const METHODS: readonly Method[] = ['USDC', 'USDT', 'EUR Bank']
export const isMethod = (x: unknown): x is Method => typeof x === 'string' && (METHODS as readonly string[]).includes(x)
export const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
export const isFiniteNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

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
  Array.isArray(x.recipients) &&
  x.recipients.every(isPayrollRecipient)
