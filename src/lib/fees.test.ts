import { describe, expect, it } from 'vitest'
import { ASSUMED_APY, estimateAnnualCost, PROVIDERS } from './fees'

describe('estimateAnnualCost', () => {
  const input = { monthlyPayroll: 100000, contractors: 10, idleBalance: 200000 }

  it('calculates Zeno fees and subtracts annual idle-balance yield', () => {
    expect(ASSUMED_APY).toBe(0.045)
    expect(estimateAnnualCost(input)[0]).toEqual({
      id: 'zeno',
      name: 'Zeno',
      annualFees: 2400,
      yieldEarned: 9000,
      net: -6600,
    })
  })
  it('uses the midpoint of the Wise fee range', () => {
    const wise = estimateAnnualCost(input).find((provider) => provider.id === 'wise')!
    expect(wise.annualFees).toBeCloseTo(11400)
    expect(wise.yieldEarned).toBe(0)
    expect(wise.net).toBeCloseTo(11400)
  })
  it('charges Deel per contractor per month', () => {
    const deel = estimateAnnualCost(input).find((provider) => provider.id === 'deel')!
    expect(deel.annualFees).toBe(5880)
    expect(deel.net).toBe(5880)
  })
  it('adds wire fees to the SWIFT percentage spread', () => {
    const swift = estimateAnnualCost(input).find((provider) => provider.id === 'swift')!
    expect(swift.annualFees).toBe(28500)
    expect(swift.net).toBe(28500)
  })
  it('produces zero costs and yield for zero inputs', () => {
    const results = estimateAnnualCost({ monthlyPayroll: 0, contractors: 0, idleBalance: 0 })
    expect(results).toHaveLength(4)
    for (const result of results) {
      expect(result.annualFees).toBe(0)
      expect(result.yieldEarned).toBe(0)
      expect(result.net).toBe(0)
    }
  })
  it('grants yield only to Zeno', () => {
    expect(
      estimateAnnualCost(input)
        .slice(1)
        .map((provider) => provider.yieldEarned),
    ).toEqual([0, 0, 0])
  })
  it('scales fees and yield linearly', () => {
    const doubled = estimateAnnualCost({
      monthlyPayroll: 200000,
      contractors: 20,
      idleBalance: 400000,
    })
    estimateAnnualCost(input).forEach((result, index) => {
      expect(doubled[index].annualFees).toBeCloseTo(result.annualFees * 2)
      expect(doubled[index].net).toBeCloseTo(result.net * 2)
    })
  })
  it.each([
    { monthlyPayroll: -1 },
    { contractors: -1 },
    { idleBalance: -1 },
    { monthlyPayroll: NaN },
    { contractors: Infinity },
    { idleBalance: Infinity },
    { contractors: 1.5 },
  ])('rejects invalid input %j', (invalid) => {
    expect(() => estimateAnnualCost({ ...input, ...invalid })).toThrow(RangeError)
  })
  it('exports source notes and explicit prototype assumptions', () => {
    expect(PROVIDERS[0].note).toMatch(/Prototype/)
    for (const provider of PROVIDERS.slice(1)) expect(provider.note).toContain('https://')
  })
})
