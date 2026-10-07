import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useCountUp(
  target: number,
  opts: { durationMs?: number; start?: boolean; decimals?: number } = {},
) {
  const { durationMs = 1200, start = true, decimals = 0 } = opts
  const [value, setValue] = useState(start ? 0 : target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!start) return
    if (prefersReducedMotion()) {
      setValue(Number(target.toFixed(decimals)))
      return
    }
    let t0: number | null = null
    const from = 0
    const to = target
    const tick = (t: number) => {
      if (t0 === null) t0 = t
      const elapsed = t - t0
      const p = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      const v = from + (to - from) * eased
      setValue(Number(v.toFixed(decimals)))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, durationMs, start, decimals])

  return value
}

export function useInView<T extends Element>(opts: IntersectionObserverInit = { threshold: 0.3 }) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
          break
        }
      }
    }, opts)
    io.observe(el)
    return () => io.disconnect()
  }, [opts])

  return { ref, inView }
}
