export type Method = 'USDC' | 'USDT' | 'EUR Bank'

export type Member = {
  id: string
  name: string
  role: string
  country: string
  countryCode: string
  method: Method
  amount: number
  initials: string
  avatarColor: string
  wallet?: string
  email?: string
}

export type ActivityType = 'Payroll' | 'Yield' | 'Deposit' | 'Swap' | 'Withdrawal'

export type Activity = {
  id: string
  type: ActivityType
  detail: string
  amount: number
  date: string
  createdAt?: number
}

export type PayrollRecipient = {
  memberId: string
  name: string
  method: Method
  amount: number
  txHash: string
  status: 'sent' | 'failed'
}

export type PayrollRun = {
  id: string
  clientRunId: string
  createdAt: number
  total: number
  fee: number
  recipients: PayrollRecipient[]
}

export type PayrollRunInput = {
  clientRunId: string
  total: number
  fee: number
  recipients: Array<Omit<PayrollRecipient, 'txHash'> & { txHash?: string }>
}

export type Theme = 'light' | 'dark' | 'system'

export const team: Member[] = [
  {
    id: '1',
    name: 'Ana Silva',
    role: 'Lead Engineer',
    country: 'Brazil',
    countryCode: 'BR',
    method: 'USDC',
    amount: 4200,
    initials: 'AS',
    avatarColor: 'bg-emerald-600',
    wallet: '0x0000000000000000000000000000000000000001',
  },
  {
    id: '2',
    name: 'Rohan Kumar',
    role: 'Backend Dev',
    country: 'India',
    countryCode: 'IN',
    method: 'USDT',
    amount: 5800,
    initials: 'RK',
    avatarColor: 'bg-orange-600',
    wallet: '0x0000000000000000000000000000000000000002',
  },
  {
    id: '3',
    name: 'Léa Martin',
    role: 'Product Designer',
    country: 'France',
    countryCode: 'FR',
    method: 'EUR Bank',
    amount: 6500,
    initials: 'LM',
    avatarColor: 'bg-amber-700',
  },
  {
    id: '4',
    name: 'Ji-woo Lee',
    role: 'Data Scientist',
    country: 'S. Korea',
    countryCode: 'KR',
    method: 'USDC',
    amount: 5200,
    initials: 'JL',
    avatarColor: 'bg-fuchsia-700',
    wallet: '0x0000000000000000000000000000000000000004',
  },
  {
    id: '5',
    name: 'Amara Osei',
    role: 'Fullstack Dev',
    country: 'Ghana',
    countryCode: 'GH',
    method: 'USDT',
    amount: 3900,
    initials: 'AO',
    avatarColor: 'bg-rose-700',
    wallet: '0x0000000000000000000000000000000000000005',
  },
]

export const treasury = {
  balance: 392140,
  yieldMtd: 1842,
  apy: 4.5,
  allocation: [
    { label: 'T-bill tokens', pct: 60, color: '#22c55e' },
    { label: 'USDC', pct: 25, color: '#3b82f6' },
    { label: 'USDT', pct: 15, color: '#a78bfa' },
  ],
}

function shortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return shortDate(d)
}

function lastEom(): { label: string; monthLong: string } {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(0) // moves to last day of prior month
  return { label: shortDate(d), monthLong: d.toLocaleDateString('en-US', { month: 'long' }) }
}

const _eom = lastEom()

export const recentActivity: Activity[] = [
  {
    id: 'a',
    type: 'Payroll',
    detail: `${_eom.monthLong} payroll · ${team.length} contractors`,
    amount: -24900,
    date: _eom.label,
  },
  {
    id: 'b',
    type: 'Yield',
    detail: 'T-bill token yield · accrued',
    amount: 612,
    date: daysAgo(27),
  },
  {
    id: 'c',
    type: 'Deposit',
    detail: 'Wire from Mercury · USDC',
    amount: 50000,
    date: daysAgo(31),
  },
  { id: 'd', type: 'Swap', detail: 'USDC → T-bill tokens', amount: -30000, date: daysAgo(35) },
  {
    id: 'e',
    type: 'Yield',
    detail: 'T-bill token yield · accrued',
    amount: 598,
    date: daysAgo(41),
  },
]

export const archiveActivity: Activity[] = (() => {
  const twoMonthsBack = new Date()
  twoMonthsBack.setHours(12, 0, 0, 0)
  twoMonthsBack.setDate(1)
  twoMonthsBack.setMonth(twoMonthsBack.getMonth() - 1)
  twoMonthsBack.setDate(0) // EOM of two months ago
  const twoBack = {
    label: shortDate(twoMonthsBack),
    monthLong: twoMonthsBack.toLocaleDateString('en-US', { month: 'long' }),
  }

  const threeMonthsBack = new Date()
  threeMonthsBack.setHours(12, 0, 0, 0)
  threeMonthsBack.setDate(1)
  threeMonthsBack.setMonth(threeMonthsBack.getMonth() - 2)
  threeMonthsBack.setDate(0) // EOM of three months ago
  const threeBack = {
    label: shortDate(threeMonthsBack),
    monthLong: threeMonthsBack.toLocaleDateString('en-US', { month: 'long' }),
  }

  return [
    {
      id: 'f',
      type: 'Payroll',
      detail: `${twoBack.monthLong} payroll · ${team.length} contractors`,
      amount: -24200,
      date: twoBack.label,
    },
    {
      id: 'g',
      type: 'Deposit',
      detail: 'Wire from Mercury · USDC',
      amount: 75000,
      date: daysAgo(70),
    },
    { id: 'h', type: 'Swap', detail: 'USDT → T-bill tokens', amount: -20000, date: daysAgo(78) },
    {
      id: 'i',
      type: 'Yield',
      detail: 'T-bill token yield · accrued',
      amount: 547,
      date: threeBack.label,
    },
    {
      id: 'j',
      type: 'Payroll',
      detail: `${threeBack.monthLong} payroll · ${team.length} contractors`,
      amount: -23800,
      date: threeBack.label,
    },
  ]
})()

export const competitors = [
  {
    name: 'Zeno',
    fee: '0.2%',
    speed: '< 3 min',
    yield: '4.5% APY',
    coverage: 'Global',
    highlight: true,
  },
  {
    name: 'Deel',
    fee: '1–3%',
    speed: '1–2 days',
    yield: 'None',
    coverage: 'Global',
    highlight: false,
  },
  {
    name: 'Wise',
    fee: '0.4–2%',
    speed: '1–2 days',
    yield: 'None',
    coverage: 'Most',
    highlight: false,
  },
  {
    name: 'SWIFT',
    fee: '2–7%',
    speed: '3–5 days',
    yield: 'None',
    coverage: 'Global',
    highlight: false,
  },
]
