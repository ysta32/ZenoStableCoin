import { useId, useState } from 'react'
import { formatUSD } from '../lib/money'

/** Short month names for the `count` calendar months ending with the month of `now`. */
function trailingMonths(count: number, now: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) =>
    new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1).toLocaleDateString('en-US', {
      month: 'short',
    }),
  )
}

const WIDTH = 600

export function Sparkline({
  values,
  label,
  labels,
}: {
  values: readonly number[]
  label: string
  /** One x-axis label per value. Defaults to the trailing calendar months ending this month. */
  labels?: readonly string[]
}) {
  const [active, setActive] = useState<number | null>(null)
  const tooltipId = useId()
  const count = values.length
  const months = labels && labels.length === count ? labels : trailingMonths(count)
  const columns = { gridTemplateColumns: `repeat(${Math.max(count, 1)}, minmax(0, 1fr))` }
  const colWidth = WIDTH / Math.max(count, 1)
  const max = Math.max(...values, 1) * 1.12
  const points = values.map((value, index) => ({
    x: colWidth * (index + 0.5),
    y: 144 - (value / max) * 124,
  }))
  const path = points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ')
  const area = count > 0 ? `${path} L${points[count - 1].x},144 L${points[0].x},144 Z` : ''
  // Tooltip sits above the active column; pin it to the edge for the first/last column so it never overflows.
  const tooltipPos =
    active === null
      ? undefined
      : active === 0
        ? { left: 0 }
        : active === count - 1
          ? { right: 0 }
          : { left: `${((active + 0.5) / count) * 100}%`, transform: 'translateX(-50%)' }

  return (
    <div className="mt-5" role="group" aria-label={label}>
      <div className="relative h-40">
        <svg
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          {[24, 84, 144].map((y) => (
            <line
              key={y}
              x1="0"
              x2="600"
              y1={y}
              y2={y}
              className="stroke-border-subtle"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {area && <path d={area} className="fill-brand-500/5" />}
          <path
            d={path}
            className="stroke-text-secondary"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
          {active !== null && (
            <circle
              cx={points[active].x}
              cy={points[active].y}
              r="4"
              className="fill-text-primary"
            />
          )}
        </svg>
        <div className="absolute inset-0 grid" style={columns}>
          {values.map((value, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${months[index]}: ${formatUSD(value)}`}
              aria-describedby={active === index ? tooltipId : undefined}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className="focus-ring min-h-9 rounded-control hover:bg-text-primary/[0.02]"
            />
          ))}
        </div>
        {active !== null && (
          <div
            id={tooltipId}
            role="tooltip"
            style={tooltipPos}
            className="pointer-events-none absolute top-0 whitespace-nowrap rounded-control border border-border-subtle bg-bg-elevated px-3 py-2 text-xs shadow-pop"
          >
            <span className="text-text-secondary">{months[active]}</span>
            <span className="num ml-3 text-text-primary">{formatUSD(values[active])}</span>
          </div>
        )}
      </div>
      <div
        className="mt-2 grid text-center text-[11px] text-text-muted"
        style={columns}
        aria-hidden="true"
      >
        {months.map((month, index) => (
          <span key={index}>{month}</span>
        ))}
      </div>
    </div>
  )
}
