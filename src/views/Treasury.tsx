import { FormEvent, useMemo, useRef, useState } from 'react'
import { Card, Pill, Button } from '../components/UI'
import { treasury } from '../data'
import { IconTrendUp, IconArrowRight, IconPlus } from '../components/Icons'
import { useApp, formatActivityDate } from '../context/AppContext'
import { TopBar } from '../components/TopBar'
import { ActivityIcon } from '../components/ActivityIcon'
import { Modal } from '../components/Modal'
import { Sparkline } from '../components/Sparkline'
import { formatUSD } from '../lib/money'

export function Treasury() {
  const {
    goToPayroll,
    toast,
    treasuryBalance: balance,
    treasuryYieldMtd: yieldMtd,
    activity,
    setView,
    deposit,
    withdraw,
  } = useApp()
  const [transfer, setTransfer] = useState<'deposit' | 'withdraw' | null>(null)
  const recent = activity.slice(0, 5)
  const allocationTones = ['bg-brand-500', 'bg-brand-300', 'bg-text-muted']

  const { ytdProjected, avgApy } = useMemo(() => {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const monthsElapsed = now.getMonth() + now.getDate() / daysInMonth
    const ytd = Math.round((balance * (treasury.apy / 100) * monthsElapsed) / 12)
    return { ytdProjected: ytd, avgApy: (treasury.apy - 0.08).toFixed(2) }
  }, [balance])

  return (
    <div className="flex h-full min-w-0 flex-col text-text-primary [&_h1]:font-display [&_h1]:text-[30px] [&_h1]:font-normal">
      <TopBar title="Treasury" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Working capital, working for you.</p>
            <p className="mt-1 text-xs text-text-muted">
              Demo treasury · transfers use simulated funds
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setTransfer('withdraw')}>
              Withdraw
            </Button>
            <Button onClick={() => setTransfer('deposit')}>
              <IconPlus width={14} height={14} /> Deposit
            </Button>
            <Button variant="ghost" onClick={goToPayroll}>
              Run payroll <IconArrowRight width={14} height={14} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="min-w-0 p-5 sm:p-6 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm text-text-secondary">Available balance</h2>
              <Pill tone="neutral">Demo · USDC / USDT</Pill>
            </div>
            <div className="mt-5 flex flex-wrap items-baseline gap-2">
              <span className="num !font-display text-[40px] leading-none tracking-tight sm:text-[52px]">
                {formatUSD(balance, { cents: true })}
              </span>
              <span className="text-xs text-text-muted">USD</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-positive">
              <IconTrendUp width={14} height={14} />
              <span>
                <span className="num">{formatUSD(yieldMtd, { sign: true, cents: true })}</span>{' '}
                earned this month
              </span>
            </div>

            <div className="mt-7">
              <div className="mb-2.5 flex items-center justify-between text-[12px] text-text-muted">
                <span>Model allocation</span>
                <span className="num">100%</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                {treasury.allocation.map((a, i) => (
                  <div
                    key={a.label}
                    className={allocationTones[i]}
                    style={{ width: `${a.pct}%` }}
                  />
                ))}
              </div>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {treasury.allocation.map((a, i) => (
                  <li
                    key={a.label}
                    className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2.5"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${allocationTones[i]}`} />
                    <div className="flex-1">
                      <div className="text-[12.5px] text-text-secondary">{a.label}</div>
                      <div className="num text-[14px]">{a.pct}%</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl">Yield this month</h2>
            <div className="num mt-3 text-[28px] font-semibold tracking-tight text-positive">
              {formatUSD(yieldMtd, { sign: true })}
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              <span className="num">{treasury.apy}%</span> APY · auto-compounded
            </div>
            <Sparkline
              values={[1200, 1350, 1420, 1590, 1730, 1842]}
              label="Illustrative monthly yield, last six months"
            />
            <p className="mt-3 text-[11px] text-text-muted">Illustrative yield history</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-[12.5px]">
              <div className="rounded-lg bg-bg-elevated px-3 py-2.5">
                <div className="text-text-muted">Projected · YTD</div>
                <div className="mt-1 num">{formatUSD(ytdProjected)}</div>
              </div>
              <div className="rounded-lg bg-bg-elevated px-3 py-2.5">
                <div className="text-text-muted">Avg APY</div>
                <div className="mt-1 num">{avgApy}%</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="min-w-0 overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl">Recent activity</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setView('transactions')}>
                View all <IconArrowRight width={12} height={12} />
              </Button>
            </div>
            <ul>
              {recent.length === 0 && (
                <li className="px-6 py-8 text-sm text-text-muted">
                  Deposits, withdrawals, and yield will appear here.
                </li>
              )}
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0 sm:px-6"
                >
                  <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.amount >= 0 ? 'bg-positive-soft text-positive' : 'bg-bg-inset text-text-secondary'}`}
                    >
                      <ActivityIcon type={a.type} size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[13.5px] font-medium">
                        {a.type}
                      </div>
                      <div className="break-words text-[12px] text-text-muted">{a.detail}</div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-5 pl-11 sm:w-auto sm:justify-start sm:pl-0">
                    <span
                      className={`num text-[13px] ${a.amount >= 0 ? 'text-positive' : 'text-text-primary'}`}
                    >
                      {formatUSD(a.amount, { sign: true })}
                    </span>
                    <span className="w-16 text-right text-[12px] text-text-muted">
                      {formatActivityDate(a)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-xl">Put idle cash to work</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              Explore a treasury allocation that pairs tokenized T-bills with stablecoins for
              payroll. This workspace simulates balances and yield.
            </p>
            <ul className="mt-4 space-y-2.5 text-[12.5px]">
              <Bullet>T-bill tokens for the reserve allocation</Bullet>
              <Bullet>USDC and USDT for operating liquidity</Bullet>
              <Bullet>Review available funds before each payroll</Bullet>
            </ul>
            <Button
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => toast('Auto-rebalance rules · coming soon')}
            >
              Configure rules
            </Button>
          </Card>
        </div>
      </div>
      {transfer && (
        <TransferForm
          mode={transfer}
          balance={balance}
          onClose={() => setTransfer(null)}
          deposit={deposit}
          withdraw={withdraw}
        />
      )}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-text-secondary">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
      <span>{children}</span>
    </li>
  )
}

const sources = ['Wire from Mercury · USD→USDC', 'USDC on Base', 'USDT on Tron']

function TransferForm({
  mode,
  balance,
  onClose,
  deposit,
  withdraw,
}: {
  mode: 'deposit' | 'withdraw'
  balance: number
  onClose: () => void
  deposit: (amount: number, source: string) => void
  withdraw: (amount: number, destination: string) => boolean
}) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState(sources[0])
  const [destination, setDestination] = useState('')
  const [errors, setErrors] = useState<{ amount?: string; destination?: string; source?: string }>(
    {},
  )
  const submitted = useRef(false)
  const amountRef = useRef<HTMLInputElement>(null)
  const destinationRef = useRef<HTMLInputElement>(null)
  const isDeposit = mode === 'deposit'
  const action = isDeposit ? 'Deposit' : 'Withdraw'
  const inputClass =
    'focus-ring mt-2 h-11 w-full rounded-control border border-border bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted'

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitted.current) return
    // Accept "1000", "1,000.50" (well-formed thousands separators) and ".5".
    const raw = amount.trim()
    const normalized = /^\d{1,3}(,\d{3})+(\.\d{0,2})?$/.test(raw) ? raw.replace(/,/g, '') : raw
    const value = Number(normalized)
    const next: typeof errors = {}
    if (
      !/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(normalized) ||
      !Number.isFinite(value) ||
      value <= 0 ||
      !Number.isSafeInteger(Math.round(value * 100))
    ) {
      next.amount = 'Enter an amount greater than zero, with up to two decimal places.'
    } else if (!isDeposit && value > balance) {
      next.amount = 'This amount exceeds your available balance.'
    } else if (isDeposit && !Number.isSafeInteger(Math.round((balance + value) * 100))) {
      next.amount = 'This deposit exceeds the supported balance. Enter a smaller amount.'
    }
    if (isDeposit && !sources.includes(source)) next.source = 'Choose a deposit source.'
    if (!isDeposit && !destination.trim())
      next.destination = 'Enter a destination for this withdrawal.'
    setErrors(next)
    if (Object.keys(next).length) {
      if (next.amount) amountRef.current?.focus()
      else if (next.destination) destinationRef.current?.focus()
      return
    }
    if (isDeposit) deposit(value, source)
    else if (!withdraw(value, destination.trim())) {
      setErrors({ amount: 'The available balance changed. Enter a smaller amount and try again.' })
      amountRef.current?.focus()
      return
    }
    submitted.current = true
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`${action} funds`}
      description="Demo transfer. No real funds will move."
    >
      <form noValidate onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="transfer-amount" className="text-sm font-medium">
            Amount in USD
          </label>
          <input
            ref={amountRef}
            id="transfer-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={!!errors.amount}
            aria-describedby={`transfer-balance${errors.amount ? ' transfer-amount-error' : ''}`}
            className={`num ${inputClass}`}
          />
          <p id="transfer-balance" className="mt-2 text-xs text-text-muted">
            Available balance <span className="num">{formatUSD(balance, { cents: true })}</span>
          </p>
          {errors.amount && (
            <p id="transfer-amount-error" role="alert" className="mt-2 text-xs text-negative">
              {errors.amount}
            </p>
          )}
        </div>
        {isDeposit ? (
          <div>
            <label htmlFor="transfer-source" className="text-sm font-medium">
              Source
            </label>
            <select
              id="transfer-source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              aria-invalid={!!errors.source}
              aria-describedby={errors.source ? 'transfer-source-error' : undefined}
              className={inputClass}
            >
              {sources.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            {errors.source && (
              <p id="transfer-source-error" role="alert" className="mt-2 text-xs text-negative">
                {errors.source}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="transfer-destination" className="text-sm font-medium">
              Destination
            </label>
            <input
              ref={destinationRef}
              id="transfer-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Wallet address or bank account label"
              maxLength={200}
              aria-invalid={!!errors.destination}
              aria-describedby={errors.destination ? 'transfer-destination-error' : undefined}
              className={`font-mono tabular-nums ${inputClass}`}
            />
            {errors.destination && (
              <p
                id="transfer-destination-error"
                role="alert"
                className="mt-2 text-xs text-negative"
              >
                {errors.destination}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-border-subtle pt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{action} funds</Button>
        </div>
      </form>
    </Modal>
  )
}
