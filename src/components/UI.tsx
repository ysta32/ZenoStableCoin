import { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCountUp, useInView } from '../hooks/useCountUp'

export type PillTone = 'neutral' | 'green' | 'blue' | 'purple' | 'amber' | 'positive' | 'negative' | 'warning' | 'brand'

export function Pill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: PillTone
  className?: string
}) {
  // Quiet, low-chroma tints. Legacy tone names map onto Ledger semantics:
  // green -> positive, amber -> warning, blue -> info, purple -> neutral outline.
  const tones: Record<PillTone, string> = {
    neutral: 'bg-bg-inset text-text-secondary ring-border-subtle',
    green: 'bg-positive-soft text-positive ring-positive/15',
    positive: 'bg-positive-soft text-positive ring-positive/15',
    brand: 'bg-brand-50 text-brand-500 ring-brand-500/15',
    blue: 'bg-info-500/[0.08] text-info-500 ring-info-500/15',
    purple: 'bg-bg-surface text-text-secondary ring-border',
    amber: 'bg-warning-soft text-warning ring-warning/20',
    warning: 'bg-warning-soft text-warning ring-warning/20',
    negative: 'bg-negative-soft text-negative ring-negative/15',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] px-1.5 py-0.5 text-[11.5px] font-medium leading-4 ring-1 ring-inset ${tones[tone] ?? tones.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

export function LiveDot() {
  const reduce = useReducedMotion()
  return (
    <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-positive"
          animate={{ opacity: [0.35, 0, 0.35], scale: [1, 2.2, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
    </span>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  onMouseEnter,
  onFocus,
  type = 'button',
  className = '',
  disabled,
  title,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'sm' | 'lg'
  onClick?: () => void
  onMouseEnter?: () => void
  onFocus?: () => void
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
  title?: string
}) {
  // sm is visually 32px but its hit area is extended to 40px via ::before.
  const sizes = {
    sm: "h-8 px-3 text-[13px] before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
    md: 'h-9 px-3.5 text-[13.5px]',
    lg: 'h-11 px-5 text-[15px]',
  }
  const variants = {
    primary:
      'bg-brand-500 text-text-inverse shadow-card hover:bg-brand-600 active:bg-brand-700',
    secondary:
      'bg-bg-surface text-text-primary border border-border shadow-card hover:bg-bg-elevated hover:border-text-muted/40 active:bg-bg-inset',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-text-primary/[0.05] active:bg-text-primary/[0.08]',
    danger:
      'bg-bg-surface text-negative border border-negative/30 hover:bg-negative-soft hover:border-negative/50 active:bg-negative-soft',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      disabled={disabled}
      title={title}
      className={`relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] font-medium transition-colors duration-150 ease-out focus-ring disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[10px] border border-border-subtle bg-bg-surface shadow-card ${className}`}>{children}</div>
  )
}

/**
 * Neutral initials avatar. `color` is kept for API compatibility but is
 * intentionally not rendered: Ledger avoids rainbow avatar fills.
 */
export function Avatar({ initials, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full bg-bg-inset font-medium text-text-secondary ring-1 ring-inset ring-border-subtle"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.34)), letterSpacing: '0.02em' }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function CountryBadge({ code, name }: { code: string; name: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="num rounded-[4px] bg-bg-inset px-1.5 py-0.5 text-[10.5px] font-medium text-text-secondary ring-1 ring-inset ring-border-subtle">
        {code}
      </span>
      <span className="text-[13.5px] text-text-primary">{name}</span>
    </div>
  )
}

export function MethodBadge({ method }: { method: 'USDC' | 'USDT' | 'EUR Bank' }) {
  if (method === 'EUR Bank') return <Pill tone="neutral">EUR bank</Pill>
  return <Pill tone="brand">{method}</Pill>
}

export function CountUpNumber({
  target,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  durationMs = 1400,
  when = 'mount',
}: {
  target: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  durationMs?: number
  when?: 'mount' | 'inView'
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.3 })
  const start = when === 'mount' ? true : inView
  const value = useCountUp(target, { durationMs, start, decimals })
  const formatted = value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
