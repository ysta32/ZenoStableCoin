import { useId, useState } from 'react'
import { formatUSD } from '../lib/money'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export function Sparkline({ values, label }: { values: readonly number[]; label: string }) {
  const [active, setActive] = useState<number | null>(null)
  const tooltipId = useId()
  const max = Math.max(...values, 1) * 1.12
  const points = values.map((value, index) => ({
    x: 50 + index * 100,
    y: 144 - (value / max) * 124,
  }))
  const path = points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ')

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
          <path d={`${path} L550,144 L50,144 Z`} className="fill-brand-500/5" />
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
        <div className="absolute inset-0 grid grid-cols-6">
          {values.map((value, index) => (
            <button
              key={months[index]}
              type="button"
              aria-label={`${months[index]}: ${formatUSD(value, { cents: true })}`}
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
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-control border border-border-subtle bg-bg-elevated px-3 py-2 text-xs shadow-pop"
          >
            <span className="text-text-secondary">{months[active]}</span>
            <span className="num ml-3 text-text-primary">
              {formatUSD(values[active], { cents: true })}
            </span>
          </div>
        )}
      </div>
      <div
        className="mt-2 grid grid-cols-6 text-center text-[11px] text-text-muted"
        aria-hidden="true"
      >
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  )
}
