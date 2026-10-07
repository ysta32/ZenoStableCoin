import { describe, expect, it } from 'vitest'
import { isPayrollRun } from './persistGuards'

const recipient = { memberId: 'm1', name: 'Ana', method: 'USDC', amount: 100, txHash: '0xabc', status: 'sent' }
const run = { id: 'r1', clientRunId: 'c1', createdAt: 1, total: 100, fee: 1, recipients: [recipient] }

describe('isPayrollRun', () => {
  it('accepts a well-formed run', () => {
    expect(isPayrollRun(run)).toBe(true)
  })
  it.each([
    ['null recipient', [null]],
    ['bad method', [{ ...recipient, method: 'BTC' }]],
    ['non-finite amount', [{ ...recipient, amount: Infinity }]],
    ['missing txHash', [{ ...recipient, txHash: undefined }]],
    ['unknown status', [{ ...recipient, status: 'pending' }]],
    ['non-string name', [{ ...recipient, name: 5 }]],
  ])('rejects %s', (_label, recipients) => {
    expect(isPayrollRun({ ...run, recipients })).toBe(false)
  })
})
