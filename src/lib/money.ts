export function formatUSD(
  n: number,
  opts: { cents?: boolean; sign?: boolean; compact?: boolean } = {},
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: opts.compact ? 'compact' : 'standard',
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : opts.compact ? 1 : 0,
    signDisplay: opts.sign ? 'exceptZero' : 'auto',
  }).format(Object.is(n, -0) ? 0 : n)
}
