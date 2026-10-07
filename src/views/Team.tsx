import { FormEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Card, Avatar, MethodBadge, Button } from '../components/UI'
import { useApp } from '../context/AppContext'
import type { Member, Method } from '../data'
import { IconPlus, IconX } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { isEvmAddress } from '../lib/csv'
import { formatUSD } from '../lib/money'

const COUNTRIES: { name: string; code: string }[] = [
  { name: 'Argentina', code: 'AR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Canada', code: 'CA' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Ghana', code: 'GH' },
  { name: 'India', code: 'IN' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Philippines', code: 'PH' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'S. Korea', code: 'KR' },
  { name: 'Spain', code: 'ES' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
]

const METHODS: Method[] = ['USDC', 'USDT', 'EUR Bank']

type FormState = {
  name: string
  role: string
  email: string
  countryCode: string
  method: Method
  amount: string
  wallet: string
}
type Errors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Enter a name.'
  if (!f.role.trim()) e.role = 'Enter a role.'
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address.'
  const amount = Number(f.amount)
  if (!f.amount.trim() || !Number.isFinite(amount) || amount <= 0) e.amount = 'Enter an amount greater than 0.'
  if (f.method !== 'EUR Bank') {
    const w = f.wallet.trim()
    if (!w) e.wallet = `A wallet address is required to pay in ${f.method}.`
    else if (!isEvmAddress(w)) e.wallet = 'Enter a valid EVM address: 0x followed by 40 hex characters.'
  }
  return e
}

export function Team() {
  const { team, goToPayroll, addMember, updateMember, removeMember, defaultMethod, toast } = useApp()
  const [query, setQuery] = useState('')
  const [panel, setPanel] = useState<{ mode: 'add' } | { mode: 'edit'; id: string } | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const addRef = useRef<HTMLButtonElement | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return team
    return team.filter((m) => [m.name, m.role, m.country, m.email ?? ''].some((s) => s.toLowerCase().includes(q)))
  }, [team, query])

  const monthly = useMemo(() => team.reduce((s, m) => s + m.amount, 0), [team])
  const editing = panel?.mode === 'edit' ? team.find((m) => m.id === panel.id) : undefined

  const open = (p: NonNullable<typeof panel>) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPanel(p)
  }
  const close = () => {
    setPanel(null)
    requestAnimationFrame(() => {
      const el = returnFocus.current
      if (el && el.isConnected) el.focus()
      else addRef.current?.focus()
    })
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Team">
        <Button variant="secondary" onClick={goToPayroll}>Run payroll</Button>
        <button
          ref={addRef}
          type="button"
          onClick={() => open({ mode: 'add' })}
          className="relative inline-flex h-9 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] bg-brand-500 px-3.5 text-[13.5px] font-medium text-text-inverse shadow-card transition-colors hover:bg-brand-600 focus-ring"
        >
          <IconPlus width={14} height={14} /> Add contractor
        </button>
      </TopBar>
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Monthly commitment</p>
            <p className="num mt-1 font-display text-[28px] leading-none text-text-primary">{formatUSD(monthly)}</p>
            <p className="mt-1.5 text-[13px] text-text-secondary">
              across {team.length} {team.length === 1 ? 'contractor' : 'contractors'}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <label htmlFor="team-search" className="sr-only">Search contractors</label>
            <input
              id="team-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, role, or country"
              className="h-9 w-full rounded-[6px] border border-border bg-bg-surface px-3 text-[13.5px] text-text-primary placeholder:text-text-muted focus-ring"
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-[20px] text-text-primary">
                {team.length === 0 ? 'No contractors yet' : 'No matches'}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-text-secondary">
                {team.length === 0
                  ? 'Add your first contractor to start paying them in stablecoins.'
                  : `Nobody matches “${query}”. Try a different name, role, or country.`}
              </p>
              {team.length === 0 && (
                <Button className="mt-5" onClick={() => open({ mode: 'add' })}>Add contractor</Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[2.2fr_1.2fr_1fr_1fr_72px] gap-4 border-b border-border-subtle bg-bg-elevated px-5 py-2.5 md:grid">
                <span className="eyebrow">Contractor</span>
                <span className="eyebrow">Country</span>
                <span className="eyebrow">Method</span>
                <span className="eyebrow text-right">Monthly</span>
                <span className="sr-only">Actions</span>
              </div>
              <ul>
                {filtered.map((m) => (
                  <li
                    key={m.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-border-subtle px-5 py-3.5 last:border-b-0 hover:bg-bg-elevated md:grid-cols-[2.2fr_1.2fr_1fr_1fr_72px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={m.initials} color={m.avatarColor} size={36} />
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-medium text-text-primary">{m.name || 'Unnamed'}</div>
                        <div className="truncate text-[12.5px] text-text-secondary">{m.role}</div>
                      </div>
                    </div>
                    <div className="order-3 col-span-2 text-[12.5px] text-text-secondary md:order-none md:col-span-1">
                      {m.country}
                    </div>
                    <div className="order-4 col-span-2 md:order-none md:col-span-1"><MethodBadge method={m.method} /></div>
                    <div className="num text-right text-[14px] text-text-primary">
                      {formatUSD(m.amount)}
                      <span className="font-sans text-[12px] text-text-muted">/mo</span>
                    </div>
                    <div className="order-5 col-span-2 flex justify-end md:order-none md:col-span-1">
                      <Button variant="ghost" size="sm" onClick={() => open({ mode: 'edit', id: m.id })}>
                        Edit<span className="sr-only"> {m.name}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {panel && (panel.mode === 'add' || editing) && (
        <MemberPanel
          key={panel.mode === 'edit' ? panel.id : 'new'}
          member={editing}
          defaultMethod={defaultMethod}
          onClose={close}
          onSave={(values) => {
            if (editing) {
              updateMember(editing.id, values)
              toast(`${values.name} updated`, 'green')
            } else {
              addMember(values)
              toast(`${values.name} added to your team`, 'green')
            }
            close()
          }}
          onRemove={
            editing
              ? () => {
                  removeMember(editing.id)
                  toast(`${editing.name || 'Contractor'} removed`, 'neutral')
                  close()
                }
              : undefined
          }
        />
      )}
    </div>
  )
}

type SavedValues = Pick<Member, 'name' | 'role' | 'country' | 'countryCode' | 'method' | 'amount'> & {
  wallet?: string
  email?: string
}

function MemberPanel({
  member,
  defaultMethod,
  onClose,
  onSave,
  onRemove,
}: {
  member?: Member
  defaultMethod: Method
  onClose: () => void
  onSave: (v: SavedValues) => void
  onRemove?: () => void
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>({
    name: member?.name ?? '',
    role: member?.role ?? '',
    email: member?.email ?? '',
    countryCode: member?.countryCode ?? 'US',
    method: member?.method ?? defaultMethod,
    amount: member ? String(member.amount) : '',
    wallet: member?.wallet ?? '',
  })
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const removeWrap = useRef<HTMLDivElement | null>(null)
  const removeMounted = useRef(false)
  useEffect(() => {
    if (!removeMounted.current) {
      removeMounted.current = true
      return
    }
    removeWrap.current?.querySelector<HTMLElement>('button')?.focus()
  }, [confirmRemove])

  const errors = validate(form)
  const show = (k: keyof FormState) => (submitted || touched[k] ? errors[k] : undefined)
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))
  const blur = (k: keyof FormState) => () => setTouched((t) => ({ ...t, [k]: true }))

  const countries = useMemo(() => {
    if (member && !COUNTRIES.some((c) => c.code === member.countryCode)) {
      return [...COUNTRIES, { name: member.country, code: member.countryCode }]
    }
    return COUNTRIES
  }, [member])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  // Esc closes; Tab stays inside the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      if (!panelRef.current.contains(document.activeElement)) {
        e.preventDefault()
        panelRef.current.querySelector<HTMLElement>('input, select, button')?.focus()
        return
      }
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    const firstKey = (Object.keys(errs) as (keyof FormState)[])[0]
    if (firstKey) {
      panelRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus()
      return
    }
    const country = countries.find((c) => c.code === form.countryCode) ?? COUNTRIES[0]
    onSave({
      name: form.name.trim(),
      role: form.role.trim(),
      country: country.name,
      countryCode: country.code,
      method: form.method,
      amount: Number(form.amount),
      email: form.email.trim() || undefined,
      wallet: form.method === 'EUR Bank' ? undefined : form.wallet.trim() || undefined,
    })
  }

  const needsWallet = form.method !== 'EUR Bank'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-text-primary/30" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-[440px] flex-col border-l border-border-subtle bg-bg-surface shadow-pop"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <h2 id={titleId} className="font-display text-[22px] leading-tight text-text-primary">
              {member ? 'Edit contractor' : 'Add contractor'}
            </h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              {member ? 'Changes apply to the next payroll run.' : 'They will appear in your next payroll run.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-[6px] text-text-secondary transition-colors hover:bg-text-primary/[0.05] hover:text-text-primary focus-ring"
          >
            <IconX width={16} height={16} />
          </button>
        </header>

        <form id="member-form" onSubmit={submit} noValidate className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <Field label="Full name" error={show('name')} htmlFor="mf-name">
            <input
              ref={nameRef}
              id="mf-name"
              name="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              onBlur={blur('name')}
              autoComplete="off"
              aria-invalid={!!show('name')}
              aria-describedby={show('name') ? 'mf-name-err' : undefined}
              className={inputCls(!!show('name'))}
            />
          </Field>
          <Field label="Role" error={show('role')} htmlFor="mf-role">
            <input
              id="mf-role"
              name="role"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              onBlur={blur('role')}
              autoComplete="off"
              aria-invalid={!!show('role')}
              aria-describedby={show('role') ? 'mf-role-err' : undefined}
              className={inputCls(!!show('role'))}
            />
          </Field>
          <Field label="Email" optional error={show('email')} htmlFor="mf-email">
            <input
              id="mf-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              onBlur={blur('email')}
              autoComplete="off"
              aria-invalid={!!show('email')}
              aria-describedby={show('email') ? 'mf-email-err' : undefined}
              className={inputCls(!!show('email'))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country" htmlFor="mf-country">
              <select
                id="mf-country"
                name="countryCode"
                value={form.countryCode}
                onChange={(e) => set('countryCode', e.target.value)}
                className={inputCls(false)}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Monthly amount (USD)" error={show('amount')} htmlFor="mf-amount">
              <input
                id="mf-amount"
                name="amount"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                onBlur={blur('amount')}
                aria-invalid={!!show('amount')}
                aria-describedby={show('amount') ? 'mf-amount-err' : undefined}
                className={`${inputCls(!!show('amount'))} num`}
              />
            </Field>
          </div>
          <fieldset>
            <legend className="mb-1.5 text-[13px] font-medium text-text-primary">Payout method</legend>
            <div className="grid grid-cols-3 gap-1 rounded-[8px] bg-bg-inset p-1" role="radiogroup">
              {METHODS.map((m) => (
                <label
                  key={m}
                  className={`flex h-8 cursor-pointer items-center justify-center rounded-[6px] text-[13px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                    form.method === m
                      ? 'bg-bg-surface text-text-primary shadow-card'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={form.method === m}
                    onChange={() => set('method', m)}
                    className="sr-only"
                  />
                  {m === 'EUR Bank' ? 'EUR bank' : m}
                </label>
              ))}
            </div>
          </fieldset>
          {needsWallet && (
            <Field label="Wallet address" error={show('wallet')} htmlFor="mf-wallet" hint="EVM address that receives the payout.">
              <input
                id="mf-wallet"
                name="wallet"
                value={form.wallet}
                onChange={(e) => set('wallet', e.target.value)}
                onBlur={blur('wallet')}
                placeholder="0x…"
                spellCheck={false}
                autoComplete="off"
                aria-invalid={!!show('wallet')}
                aria-describedby={show('wallet') ? 'mf-wallet-err' : 'mf-wallet-hint'}
                className={`${inputCls(!!show('wallet'))} num`}
              />
            </Field>
          )}
        </form>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border-subtle bg-bg-surface px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div ref={removeWrap} className="[&>div]:flex-wrap">
            {onRemove &&
              (confirmRemove ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(false)}>Keep</Button>
                  <Button variant="danger" size="sm" onClick={onRemove}>Confirm remove</Button>
                </div>
              ) : (
                <Button variant="danger" size="sm" onClick={() => setConfirmRemove(true)}>Remove</Button>
              ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <button
              type="submit"
              form="member-form"
              className="relative inline-flex h-9 select-none items-center justify-center whitespace-nowrap rounded-[6px] bg-brand-500 px-3.5 text-[13.5px] font-medium text-text-inverse shadow-card transition-colors duration-150 ease-out hover:bg-brand-600 focus-ring"
            >
              {member ? 'Save changes' : 'Add contractor'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function inputCls(invalid: boolean) {
  return `h-9 w-full rounded-[6px] border bg-bg-surface px-3 text-[13.5px] text-text-primary placeholder:text-text-muted focus-ring ${
    invalid ? 'border-negative' : 'border-border'
  }`
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-text-primary">
        <span>{label}</span>
        {optional && <span className="text-[12px] font-normal text-text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-err`} role="alert" className="mt-1.5 text-[12.5px] text-negative">{error}</p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-[12.5px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
