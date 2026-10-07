/**
 * Zeno wordmark. The mark is a ruled circle (a balanced ledger line with the
 * settled half filled). Everything uses currentColor so it adapts to theme.
 */
export function LogoMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12A9 9 0 0 0 21 12Z" fill="currentColor" />
    </svg>
  )
}

export function Logo({ size = 28 }: { size?: number }) {
  const markSize = Math.round(size * 0.78)
  return (
    <div className="flex items-center gap-2 text-text-primary" aria-label="Zeno">
      <LogoMark size={markSize} className="text-brand-500" />
      <span
        className="font-display font-medium leading-none tracking-[-0.01em]"
        style={{ fontSize: Math.round(size * 0.72) }}
      >
        Zeno
      </span>
    </div>
  )
}
