import { useMemo, useState } from 'react'
import { Avatar, Button, Card, CountryBadge, MethodBadge } from '../../components/UI'
import { IconArrowRight, IconPlus, IconX } from '../../components/Icons'
import { useApp } from '../../context/AppContext'
import type { Member, Method } from '../../data'
import { ImportDialog } from './ImportDialog'
import { MAX_AMOUNT, feeFor, memberError, sumCents, toCents } from './ledger'
import { TotalsLedger } from './TotalsLedger'

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
]
const METHODS: Method[] = ['USDC', 'USDT', 'EUR Bank']

const COLS = 'md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_40px]'
const control =
  'focus-ring h-9 rounded-[6px] border border-border bg-bg-surface px-2.5 text-[13px] text-text-primary hover:border-text-muted/40'

export function StepAmounts({ onNext }: { onNext: () => void }) {
  const { team, setAmount, addMember, removeMember, toast } = useApp()
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())
  const [importOpen, setImportOpen] = useState(false)

  const subtotal = useMemo(() => sumCents(team.map((m) => Number(m.amount) || 0)), [team])
  const invalid = useMemo(() => team.filter((m) => memberError(m) !== null).length, [team])

  const handleAdd = () => {
    const id = addMember({ name: '' })
    setFreshIds((s) => new Set(s).add(id))
    toast('New member added. Fill in their details.')
  }

  const blocked = team.length === 0 || invalid > 0

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-[26px] leading-tight text-text-primary">Set payroll amounts</h2>
          <p className="mt-1 text-[13.5px] text-text-secondary">
            Amounts are in USD. Stablecoin recipients settle 1:1.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)} className="flex-1 sm:flex-none">
            Import CSV
          </Button>
          <Button variant="secondary" onClick={handleAdd} className="flex-1 sm:flex-none">
            <IconPlus width={14} height={14} /> Add member
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div
          className={`hidden border-b border-border-subtle bg-bg-elevated px-5 py-2.5 md:grid md:gap-4 ${COLS}`}
          aria-hidden="true"
        >
          <div className="eyebrow">Recipient</div>
          <div className="eyebrow">Country</div>
          <div className="eyebrow">Method</div>
          <div className="eyebrow text-right">Amount (USD)</div>
          <div />
        </div>
        <ul aria-label="Payroll recipients">
          {team.length === 0 && (
            <li className="px-6 py-12 text-center">
              <div className="text-[14px] font-medium text-text-primary">No recipients yet</div>
              <div className="mt-1 text-[13px] text-text-secondary">Add a member or import a CSV to start.</div>
            </li>
          )}
          {team.map((m) => (
            <MemberRow
              key={m.id}
              m={m}
              isFresh={freshIds.has(m.id)}
              setAmount={setAmount}
              removeMember={removeMember}
            />
          ))}
        </ul>
        <div className="grid gap-4 border-t border-border-subtle bg-bg-elevated px-5 py-4 md:grid-cols-[1fr_minmax(0,340px)]">
          <div className="text-[13px] text-text-secondary">
            {invalid > 0 ? (
              <p role="status" className="text-negative">
                {invalid} row{invalid === 1 ? ' needs' : 's need'} attention before review.
              </p>
            ) : (
              <p role="status">
                {team.length} recipient{team.length === 1 ? '' : 's'} ready.
              </p>
            )}
          </div>
          <TotalsLedger subtotal={subtotal} fee={feeFor(subtotal)} recipients={team.length} />
        </div>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="lg" onClick={onNext} disabled={blocked} className="w-full sm:w-auto">
          Continue to review <IconArrowRight width={16} height={16} />
        </Button>
      </div>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}

function MemberRow({
  m,
  isFresh,
  setAmount,
  removeMember,
}: {
  m: Member
  isFresh: boolean
  setAmount: (id: string, v: number) => void
  removeMember: (id: string) => void
}) {
  const { updateMember } = useApp()
  const error = memberError(m)
  const errorId = `amount-error-${m.id}`
  const countries = COUNTRIES.some((c) => c.code === m.countryCode)
    ? COUNTRIES
    : [{ code: m.countryCode, name: m.country }, ...COUNTRIES]
  const label = m.name || 'new member'

  return (
    <li
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-border-subtle px-5 py-3.5 last:border-b-0 md:gap-4 ${COLS}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar initials={m.initials} color={m.avatarColor} size={32} />
        <div className="min-w-0 flex-1">
          {isFresh ? (
            <input
              autoFocus
              value={m.name}
              onChange={(e) => updateMember(m.id, { name: e.target.value })}
              placeholder="Full name"
              aria-label="Member name"
              className={`${control} w-full`}
            />
          ) : (
            <div className="truncate text-[13.5px] font-medium text-text-primary">{m.name || 'Unnamed'}</div>
          )}
          <div className="truncate text-[12px] text-text-muted">{m.role}</div>
        </div>
      </div>

      <div className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto md:order-last">
        <button
          type="button"
          onClick={() => removeMember(m.id)}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-negative-soft hover:text-negative"
          aria-label={`Remove ${m.name || 'member'}`}
          title="Remove"
        >
          <IconX width={14} height={14} />
        </button>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2 md:contents">
        <div className="min-w-0">
          {isFresh ? (
            <select
              value={m.countryCode}
              aria-label={`Country for ${label}`}
              onChange={(e) => {
                const c = countries.find((x) => x.code === e.target.value)
                if (c) updateMember(m.id, { country: c.name, countryCode: c.code })
              }}
              className={`${control} max-w-full`}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          ) : (
            <CountryBadge code={m.countryCode} name={m.country} />
          )}
        </div>
        <div>
          {isFresh ? (
            <select
              value={m.method}
              aria-label={`Payment method for ${label}`}
              onChange={(e) => updateMember(m.id, { method: e.target.value as Method })}
              className={control}
            >
              {METHODS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <MethodBadge method={m.method} />
          )}
        </div>
      </div>

      <div className="col-span-2 md:col-span-1 md:text-right">
        <div className="relative md:ml-auto md:w-40">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={MAX_AMOUNT}
            step="0.01"
            value={m.amount === 0 ? '' : m.amount}
            onChange={(e) => {
              const v = e.target.value === '' ? 0 : Number(e.target.value)
              setAmount(m.id, toCents(v))
            }}
            placeholder="0.00"
            aria-label={`Amount in USD for ${label}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`${control} num w-full pl-6 text-right ${error ? 'border-negative' : ''}`}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-[12px] text-negative md:text-right">
            {error}
          </p>
        )}
      </div>
    </li>
  )
}
