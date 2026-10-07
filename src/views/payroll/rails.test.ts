import { describe, expect, it } from 'vitest'
import {
  centsInt,
  checkRun,
  confirmationPhrase,
  matchesConfirmation,
  type RailsRecipient,
} from './rails'

const W1 = '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE'
const W2 = '0x8ba1f109551bD432803012645Ac136ddd64DBA72'

const r = (over: Partial<RailsRecipient> & { memberId: string }): RailsRecipient => ({
  name: `Member ${over.memberId}`,
  method: 'USDC',
  amount: 100,
  wallet: over.memberId === 'a' ? W1 : W2,
  ...over,
})

const codes = (rails: { code: string }[]) => rails.map((x) => x.code)

describe('centsInt', () => {
  it('converts to whole integer cents', () => {
    expect(centsInt(12450)).toBe(1_245_000)
    expect(centsInt(0.1 + 0.2)).toBe(30)
    expect(centsInt(1.005)).toBe(101)
    expect(centsInt(Number.NaN)).toBe(0)
  })
})

describe('checkRun', () => {
  it('passes a clean run', () => {
    const res = checkRun({
      recipients: [r({ memberId: 'a' }), r({ memberId: 'b' })],
      total: 200,
      fee: 0.4,
      balance: 1000,
    })
    expect(res).toEqual({ blockers: [], warnings: [] })
  })

  it('blocks with NO_RECIPIENTS on an empty run', () => {
    const res = checkRun({ recipients: [], total: 0, fee: 0, balance: 100 })
    expect(codes(res.blockers)).toEqual(['NO_RECIPIENTS'])
    expect(res.warnings).toEqual([])
  })

  it('blocks with INSUFFICIENT_BALANCE when total + fee exceeds balance', () => {
    const res = checkRun({
      recipients: [r({ memberId: 'a' })],
      total: 100,
      fee: 0.2,
      balance: 100.19,
    })
    expect(codes(res.blockers)).toEqual(['INSUFFICIENT_BALANCE'])
    expect(res.blockers[0].message).toContain('$100.20')
    expect(res.blockers[0].message).toContain('$100.19')
    expect(res.blockers[0].message).toContain('Deposit $0.01')
  })

  it('allows a debit exactly equal to the balance', () => {
    const res = checkRun({
      recipients: [r({ memberId: 'a' })],
      total: 100,
      fee: 0.2,
      balance: 100.2,
    })
    expect(res.blockers).toEqual([])
  })

  it('compares in integer cents: 0.1 + 0.2 against a 0.3 balance is not a blocker', () => {
    expect(0.1 + 0.2 > 0.3).toBe(true)
    const res = checkRun({
      recipients: [r({ memberId: 'a', amount: 0.3 })],
      total: 0.1 + 0.2,
      fee: 0,
      balance: 0.3,
    })
    expect(res.blockers).toEqual([])
    const split = checkRun({
      recipients: [r({ memberId: 'a', amount: 0.3 })],
      total: 0.1,
      fee: 0.2,
      balance: 0.3,
    })
    expect(split.blockers).toEqual([])
  })

  it('ignores sub-cent noise below half a cent but blocks a real extra cent', () => {
    expect(
      checkRun({ recipients: [r({ memberId: 'a' })], total: 10.004, fee: 0, balance: 10 }).blockers,
    ).toEqual([])
    expect(
      codes(
        checkRun({ recipients: [r({ memberId: 'a' })], total: 10.01, fee: 0, balance: 10 })
          .blockers,
      ),
    ).toEqual(['INSUFFICIENT_BALANCE'])
  })

  it('blocks with MISSING_WALLET for USDC and USDT recipients without a wallet', () => {
    const res = checkRun({
      recipients: [
        r({ memberId: 'a', name: 'Ana', method: 'USDC', wallet: undefined }),
        r({ memberId: 'b', name: 'Ben', method: 'USDT', wallet: '   ' }),
        r({ memberId: 'c', name: 'Cy', method: 'EUR Bank', wallet: undefined }),
        r({ memberId: 'd', name: 'Di', method: 'USDC', wallet: W1 }),
      ],
      total: 400,
      fee: 0.8,
      balance: 1000,
    })
    expect(codes(res.blockers)).toEqual(['MISSING_WALLET'])
    expect(res.blockers[0].memberIds).toEqual(['a', 'b'])
    expect(res.blockers[0].message).toContain('Ana and Ben')
    expect(res.warnings).toEqual([])
  })

  it('does not require a wallet for EUR bank recipients', () => {
    const res = checkRun({
      recipients: [r({ memberId: 'c', method: 'EUR Bank', wallet: undefined })],
      total: 100,
      fee: 0.2,
      balance: 1000,
    })
    expect(res.blockers).toEqual([])
  })

  it('warns with ZERO_AMOUNT for recipients that round to $0.00', () => {
    const res = checkRun({
      recipients: [
        r({ memberId: 'a', amount: 0 }),
        r({ memberId: 'b', amount: 0.004 }),
        r({ memberId: 'c', amount: 0.01, wallet: 'x' }),
      ],
      total: 0.01,
      fee: 0,
      balance: 100,
    })
    expect(res.blockers).toEqual([])
    expect(codes(res.warnings)).toEqual(['ZERO_AMOUNT'])
    expect(res.warnings[0].memberIds).toEqual(['a', 'b'])
  })

  it('warns with DUPLICATE_WALLET per shared wallet, case-insensitively', () => {
    const res = checkRun({
      recipients: [
        r({ memberId: 'a', name: 'Ana', wallet: W1 }),
        r({ memberId: 'b', name: 'Ben', wallet: W1.toLowerCase() }),
        r({ memberId: 'c', name: 'Cy', wallet: ` ${W1} ` }),
        r({ memberId: 'd', name: 'Di', wallet: W2 }),
        r({ memberId: 'e', name: 'Ed', wallet: W2 }),
        r({ memberId: 'f', name: 'Fi', method: 'EUR Bank', wallet: undefined }),
        r({ memberId: 'g', name: 'Gu', method: 'EUR Bank', wallet: undefined }),
      ],
      total: 700,
      fee: 1.4,
      balance: 1000,
    })
    expect(res.blockers).toEqual([])
    expect(codes(res.warnings)).toEqual(['DUPLICATE_WALLET', 'DUPLICATE_WALLET'])
    expect(res.warnings[0].memberIds).toEqual(['a', 'b', 'c'])
    expect(res.warnings[0].message).toContain('Ana, Ben and Cy')
    expect(res.warnings[1].memberIds).toEqual(['d', 'e'])
  })

  it('reports multiple blockers and warnings together', () => {
    const res = checkRun({
      recipients: [
        r({ memberId: 'a', wallet: undefined, amount: 0 }),
        r({ memberId: 'b', wallet: W2 }),
        r({ memberId: 'c', wallet: W2 }),
      ],
      total: 200,
      fee: 0.4,
      balance: 50,
    })
    expect(codes(res.blockers)).toEqual(['INSUFFICIENT_BALANCE', 'MISSING_WALLET'])
    expect(codes(res.warnings)).toEqual(['ZERO_AMOUNT', 'DUPLICATE_WALLET'])
  })
})

describe('confirmationPhrase', () => {
  it('formats the total as displayed without a currency symbol', () => {
    expect(confirmationPhrase(12450)).toBe('12,450.00')
    expect(confirmationPhrase(33767.4)).toBe('33,767.40')
    expect(confirmationPhrase(0.1 + 0.2)).toBe('0.30')
    expect(confirmationPhrase(1234567.891)).toBe('1,234,567.89')
    expect(confirmationPhrase(5)).toBe('5.00')
  })
})

describe('matchesConfirmation', () => {
  it('accepts the exact phrase and tolerated variants', () => {
    for (const typed of [
      '12,450.00',
      '12450.00',
      '$12,450.00',
      '$12450.00',
      '  12,450.00  ',
      ' $ 12,450.00',
      '1,2450.00',
    ]) {
      expect(matchesConfirmation(typed, 12450)).toBe(true)
    }
  })

  it('is case-insensitive', () => {
    expect(matchesConfirmation('12,450.00', 12450)).toBe(true)
    expect(matchesConfirmation('$12,450.00'.toUpperCase(), 12450)).toBe(true)
  })

  it('rejects wrong or incomplete amounts', () => {
    for (const typed of [
      '',
      '   ',
      '$',
      '12,450',
      '12450',
      '12,450.0',
      '12,450.01',
      '12,449.99',
      '124,500.00',
      'USD 12,450.00',
      '$$12,450.00',
      '12,450.00$',
    ]) {
      expect(matchesConfirmation(typed, 12450)).toBe(false)
    }
  })

  it('matches against the cent-rounded displayed total', () => {
    expect(matchesConfirmation('0.30', 0.1 + 0.2)).toBe(true)
    expect(matchesConfirmation('33,767.40', 33767.4)).toBe(true)
    expect(matchesConfirmation('1,234,567.89', 1234567.891)).toBe(true)
  })

  it('never matches a non-finite total', () => {
    expect(matchesConfirmation('—', Number.NaN)).toBe(false)
    expect(matchesConfirmation('', Number.POSITIVE_INFINITY)).toBe(false)
  })
})
