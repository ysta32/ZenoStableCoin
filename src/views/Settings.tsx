import { ChangeEvent, ReactNode, useRef, useState } from 'react'
import { Card, Button } from '../components/UI'
import { useApp } from '../context/AppContext'
import type { Method, Theme } from '../data'
import { Modal } from '../components/Modal'
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
    theme, setTheme, defaultMethod, setDefaultMethod, resetDemo, isExecuting, toast, exportState, importState,
  } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportAll = () => {
    const url = URL.createObjectURL(new Blob([exportState()], { type: 'application/json' }))
    const a = document.createElement('a')
    try {
      a.href = url
      a.download = `zeno-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
    } finally {
      a.remove()
      URL.revokeObjectURL(url)
    }
    toast('Backup exported', 'green')
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (isExecuting) {
      setImportError('Wait for payroll to finish before importing')
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      setImportError('Could not read the file')
      return
    }
    const res = importState(text)
    setImportError(res.ok ? null : res.error)
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

          <Section title="Your data" desc="Everything is stored locally in this browser. Nothing is sent anywhere.">
            <Row label="Export backup" desc="Download team, activity, payroll runs and treasury balances as JSON.">
              <Button variant="secondary" size="sm" onClick={exportAll}>Export backup</Button>
            </Row>
            <Row label="Import backup" desc="Replace current demo data with a Zeno backup file.">
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  aria-label="Import backup file"
                  tabIndex={-1}
                  onChange={onFile}
                />
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={isExecuting}>Import backup</Button>
                {importError && <p role="alert" className="text-[12.5px] text-negative">{importError}</p>}
              </div>
            </Row>
            <Row label="Reset demo data" desc="Restores the seed team, balance and activity. This cannot be undone.">
              <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)} disabled={isExecuting}>Reset demo data</Button>
            </Row>
          </Section>
        </div>
      </div>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset demo data?"
        description="This restores the seed team, balance and activity and clears payroll runs. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setConfirmOpen(false)
                setImportError(null)
                resetDemo()
              }}
            >
              Reset demo data
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-text-secondary">Consider exporting a backup first.</p>
      </Modal>
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
