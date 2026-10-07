import { ReactNode, useEffect, useRef, useState } from 'react'
import { Card, Button } from '../components/UI'
import { useApp } from '../context/AppContext'
import type { Method, Theme } from '../data'
import { TopBar } from '../components/TopBar'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
const METHODS: { value: Method; label: string }[] = [
  { value: 'USDC', label: 'USDC' },
  { value: 'USDT', label: 'USDT' },
  { value: 'EUR Bank', label: 'EUR bank' },
]

export function Settings() {
  const {
    theme, setTheme, defaultMethod, setDefaultMethod, resetDemo, isExecuting, toast,
    team, activity, payrollRuns, treasuryBalance, treasuryYieldMtd,
  } = useApp()
  const [armed, setArmed] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const disarm = () => {
    setArmed(false)
    if (timer.current) clearTimeout(timer.current)
  }
  const arm = () => {
    if (isExecuting) {
      toast('Wait for payroll to finish before resetting', 'amber')
      return
    }
    setArmed(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setArmed(false), 6000)
  }

  const exportAll = () => {
    const data = { exportedAt: new Date().toISOString(), team, activity, payrollRuns, treasuryBalance, treasuryYieldMtd }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    try {
      a.href = url
      a.download = `zeno-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
    } finally {
      a.remove()
      URL.revokeObjectURL(url)
    }
    toast('Exported all workspace data', 'green')
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Settings" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-7">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <Section title="Workspace" desc="Identity for this demo account.">
            <Row label="Workspace name" desc="Read-only in the demo.">
              <span className="text-[13.5px] text-text-primary">Acme Corp</span>
            </Row>
          </Section>

          <Section title="Appearance" desc="Choose how Zeno looks on this device.">
            <Row label="Theme" desc="System follows your operating system setting.">
              <Segmented label="Theme" options={THEMES} value={theme} onChange={setTheme} />
            </Row>
          </Section>

          <Section title="Payout defaults" desc="Applied to new contractors you add.">
            <Row label="Default payout method" desc="Existing contractors keep their current method.">
              <Segmented label="Default payout method" options={METHODS} value={defaultMethod} onChange={setDefaultMethod} />
            </Row>
          </Section>

          <Section title="Data" desc="Everything is stored locally in this browser.">
            <Row label="Export all data" desc="Team, activity, payroll runs and treasury balances as JSON.">
              <Button variant="secondary" size="sm" onClick={exportAll}>Export JSON</Button>
            </Row>
            <Row label="Reset demo" desc="Restores the seed team, balance and activity. This cannot be undone.">
              {armed ? (
                <div className="flex items-center gap-2" role="group" aria-label="Confirm reset">
                  <Button variant="ghost" size="sm" onClick={disarm}>Cancel</Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      disarm()
                      resetDemo()
                    }}
                  >
                    Confirm reset
                  </Button>
                </div>
              ) : (
                <Button variant="danger" size="sm" onClick={arm} disabled={isExecuting}>Reset demo</Button>
              )}
            </Row>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[20px] text-text-primary">{title}</h2>
      <p className="mb-3 mt-0.5 text-[13px] text-text-secondary">{desc}</p>
      <Card className="divide-y divide-border-subtle px-5">{children}</Card>
    </section>
  )
}

function Row({ label, desc, children }: { label: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium text-text-primary">{label}</div>
        <div className="mt-0.5 text-[12.5px] text-text-secondary">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-[8px] bg-bg-inset p-1">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex h-8 min-w-[64px] cursor-pointer items-center justify-center rounded-[6px] px-3 text-[13px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
            value === o.value ? 'bg-bg-surface text-text-primary shadow-card' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <input
            type="radio"
            name={label}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}
