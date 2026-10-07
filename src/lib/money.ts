export function formatUSD(
  n: number,
  opts: { cents?: boolean; sign?: boolean; compact?: boolean } = {},
): string {
  if (!Number.isFinite(n)) return '—'

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: opts.compact ? 'compact' : 'standard',
    minimumFractionDigits: opts.compact ? 0 : opts.cents ? 2 : 0,
    maximumFractionDigits: opts.compact ? 1 : opts.cents ? 2 : 0,
    signDisplay: opts.sign ? 'exceptZero' : 'auto',
  })
  const parts = formatter.formatToParts(n)
  const isRoundedZero = parts
    .filter(({ type }) => type === 'integer' || type === 'fraction')
    .every(({ value }) => /^0+$/.test(value))
  return isRoundedZero ? formatter.format(0) : parts.map(({ value }) => value).join('')
}
