export const ASSUMED_APY = 0.045

type Provider = {
  id: 'zeno' | 'wise' | 'deel' | 'swift'
  name: string
  feePct: [number, number]
  flatPerPayment: number
  settlement: string
  note: string
}

export const PROVIDERS: Provider[] = [
  {
    id: 'zeno',
    name: 'Zeno',
    feePct: [0.2, 0.2],
    flatPerPayment: 0,
    settlement: '< 3 minutes (illustrative)',
    note: 'Prototype assumptions: 0.2% per payment and 4.5% annual yield on idle balance; not a live quote or guaranteed return.',
  },
  {
    id: 'wise',
    name: 'Wise',
    feePct: [0.4, 1.5],
    flatPerPayment: 0,
    settlement: '1–2 business days (illustrative)',
    note: 'Illustrative 0.4–1.5% range; actual fees depend on currency and route, and may include fixed charges. Source: https://wise.com/us/pricing/ and https://wise.com/help/articles/2949818/how-much-does-it-cost-to-send-money-from-a-balance',
  },
  {
    id: 'deel',
    name: 'Deel',
    feePct: [0, 0],
    flatPerPayment: 49,
    settlement: '1–3 business days (illustrative)',
    note: 'Contractor management starts at $49 per active contract per month, modeled as one monthly payment per contractor; excludes additional payout/FX fees. Source: https://www.deel.com/pricing/',
  },
  {
    id: 'swift',
    name: 'SWIFT',
    feePct: [1, 3],
    flatPerPayment: 37.5,
    settlement: '1–5 business days',
    note: 'Illustrative $25–50 wire fee (midpoint $37.50) plus 1–3% FX spread; bank and intermediary fees vary. Bank of America publishes a $45 USD international wire fee and notes FX markups for foreign-currency wires; the combined model is not its tariff. Source: https://info.bankofamerica.com/en/digital-banking/wire-transfers',
  },
]

export function estimateAnnualCost(input: {
  monthlyPayroll: number
  contractors: number
  idleBalance: number
}): { id: string; name: string; annualFees: number; yieldEarned: number; net: number }[] {
  for (const [key, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${key} must be a finite, non-negative number`)
    }
  }
  if (!Number.isInteger(input.contractors)) {
    throw new RangeError('contractors must be an integer')
  }

  return PROVIDERS.map(({ id, name, feePct, flatPerPayment }) => {
    const midpointRate = (feePct[0] + feePct[1]) / 2 / 100
    const annualFees =
      (input.monthlyPayroll * midpointRate + input.contractors * flatPerPayment) * 12
    const yieldEarned = id === 'zeno' ? input.idleBalance * ASSUMED_APY : 0
    return { id, name, annualFees, yieldEarned, net: annualFees - yieldEarned }
  })
}
