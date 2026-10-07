import { describe, expect, it } from 'vitest'
import { feeFor, round2, sumCents, toCents } from './ledger'

describe('toCents / round2', () => {
  it('rounds decimal ties up as written', () => {
    expect(toCents(1.005)).toBe(1.01)
    expect(toCents(10.075)).toBe(10.08)
    expect(toCents(1.004)).toBe(1)
  })
  it('cleans binary sum noise', () => {
    expect(toCents(0.1 + 0.2)).toBe(0.3)
    expect(sumCents([0.1, 0.2])).toBe(0.3)
  })
  it('rounds negatives half away from zero', () => {
    expect(round2(-1.005)).toBe(-1.01)
    expect(round2(-10.075)).toBe(-10.08)
    expect(Object.is(round2(-0.001), 0)).toBe(true)
  })
  it('handles exponent-form inputs', () => {
    expect(round2(1e-7)).toBe(0)
    expect(round2(5e-3)).toBe(0.01)
    expect(round2(1.5e21)).toBe(1.5e21)
    expect(round2(1.23456e3)).toBe(1234.56)
  })
  it('maps non-finite input to 0 for amounts', () => {
    expect(toCents(Number.NaN)).toBe(0)
    expect(toCents(Number.POSITIVE_INFINITY)).toBe(0)
  })
  it('keeps totals equal to the sum of cent rows', () => {
    expect(sumCents([1.004, 1.004])).toBe(2)
    expect(feeFor(1000.25)).toBe(2)
  })
})
