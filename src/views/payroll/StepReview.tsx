import { useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Card, MethodBadge } from '../../components/UI'
import { IconArrowRight, IconCheck, IconSpinner } from '../../components/Icons'
import { useApp } from '../../context/AppContext'
import type { PayrollRun } from '../../data'
import { feeFor, memberError, newClientRunId, round2, sumCents, toCents, usd } from './ledger'
import { TotalsLedger } from './TotalsLedger'
import { checkRun, confirmationPhrase, matchesConfirmation } from './rails'

const COMPLIANCE = [
  'Sanctions screening (Chainalysis)',
  'KYC verified for all recipients',
  'Tax documents on file',
]

export function StepReview({
  onBack,
  onExecuted,
}: {
  onBack: () => void
  onExecuted: (run: PayrollRun) => void
}) {
  const { team, authorized, setAuthorized, treasuryBalance, recordPayrollRun } = useApp()
  // One id per visit to Review: retries or double-clicks of Execute cannot debit twice.
  const [clientRunId] = useState(newClientRunId)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [checks, setChecks] = useState(0)
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    const timers = [300, 600, 900].map((ms, i) => window.setTimeout(() => setChecks(i + 1), ms))
    return () => timers.forEach(clearTimeout)
  }, [])

  const subtotal = useMemo(() => sumCents(team.map((m) => m.amount)), [team])
  const fee = feeFor(subtotal)
  const debit = round2(subtotal + fee)
  const invalid = team.filter((m) => memberError(m) !== null).length

  const rails = useMemo(
    () =>
      checkRun({
        recipients: team.map((m) => ({
          memberId: m.id,
          name: m.name,
          method: m.method,
          amount: m.amount,
          wallet: m.wallet,
        })),
        total: subtotal,
        fee,
        balance: treasuryBalance,
      }),
    [team, subtotal, fee, treasuryBalance],
  )
  const blockers: string[] = [
    ...rails.blockers.map((b) => b.message),
    ...(invalid > 0
      ? [
          `${invalid} recipient${invalid === 1 ? ' has' : 's have'} an invalid name or amount. Go back to fix ${invalid === 1 ? 'it' : 'them'}.`,
        ]
      : []),
  ]
  const blocked = blockers.length > 0

  const phrase = confirmationPhrase(debit)
  const confirmed = matchesConfirmation(confirmText, debit)
  const checksDone = checks >= COMPLIANCE.length
  const canExecute = !blocked && authorized && checksDone && confirmed

  const execute = () => {
    if (!canExecute) return
    setSubmitError(null)
    try {
      const run = recordPayrollRun({
        clientRunId,
        total: subtotal,
        fee,
        recipients: team.map((m) => ({
          memberId: m.id,
          name: m.name,
          method: m.method,
          amount: toCents(m.amount),
          status: 'sent' as const,
        })),
      })
      onExecuted(run)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'The payroll run could not be recorded')
    }
  }

  return (
    <>
      <h2 className="font-display text-[26px] leading-tight text-text-primary">
        Review and confirm
      </h2>
      <p className="mt-1 text-[13.5px] text-text-secondary">
        Check recipients, routing and the total debit before you execute.
      </p>

      {blocked && (
        <div className="mt-5 space-y-2">
          {blockers.map((message) => (
            <p
              key={message}
              role="alert"
              className="rounded-[6px] border border-negative/30 bg-negative-soft px-4 py-3 text-[13.5px] text-negative"
            >
              {message}
            </p>
          ))}
        </div>
      )}

      {rails.warnings.length > 0 && (
        <ul aria-label="Payroll warnings" className={`${blocked ? 'mt-2' : 'mt-5'} space-y-2`}>
          {rails.warnings.map((w) => (
            <li
              key={`${w.code}-${w.message}`}
              className="rounded-[6px] border border-warning/30 bg-warning-soft px-4 py-3 text-[13.5px] text-warning"
            >
              {w.message}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-border-subtle px-5 py-3.5">
            <h3 className="text-[15px] font-semibold text-text-primary">Recipients</h3>
            <span className="num text-[12.5px] text-text-muted">{team.length}</span>
          </div>
          <ul>
            {team.map((m) => {
              const err = memberError(m)
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
                >
                  <Avatar initials={m.initials} color={m.avatarColor} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-text-primary">
                      {m.name || 'Unnamed'}
                    </div>
                    <div className="truncate text-[12px] text-text-muted">
                      {m.country}
                      {m.wallet ? (
                        <>
                          {' · '}
                          <span className="font-mono tabular-nums">{`${m.wallet.slice(0, 6)}…${m.wallet.slice(-4)}`}</span>
                        </>
                      ) : null}
                    </div>
                    {err && <div className="text-[12px] text-negative">{err}</div>}
                  </div>
                  <div className="hidden sm:block">
                    <MethodBadge method={m.method} />
                  </div>
                  <div
                    className={`num w-28 text-right text-[13.5px] ${err ? 'text-negative' : 'text-text-primary'}`}
                  >
                    {usd(toCents(m.amount))}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="text-[15px] font-semibold text-text-primary">Totals</h3>
            <div className="mt-2">
              <TotalsLedger
                subtotal={subtotal}
                fee={fee}
                balance={treasuryBalance}
                recipients={team.length}
              />
            </div>
            <p className="mt-3 text-[12.5px] text-text-muted">
              Estimated settlement under 3 minutes.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-[15px] font-semibold text-text-primary">Compliance</h3>
            <ul className="mt-3 space-y-2.5" aria-live="polite">
              {COMPLIANCE.map((item, i) => {
                const ok = i < checks
                return (
                  <li key={item} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-positive-soft text-positive' : 'bg-bg-inset text-text-muted'}`}
                      aria-hidden="true"
                    >
                      {ok ? (
                        <IconCheck width={12} height={12} />
                      ) : (
                        <IconSpinner width={12} height={12} className="animate-spin" />
                      )}
                    </span>
                    <span className={`text-[13px] ${ok ? 'text-text-primary' : 'text-text-muted'}`}>
                      {item}
                      <span className="sr-only">{ok ? ': passed' : ': checking'}</span>
                    </span>
                  </li>
                )
              })}
            </ul>

            <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-border-subtle pt-4">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                className="focus-ring mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[4px] accent-brand-500"
              />
              <span className="text-[13px] leading-snug text-text-secondary">
                I authorize this payroll run and confirm the recipients and amounts are correct.
              </span>
            </label>

            <label className="mt-4 block border-t border-border-subtle pt-4">
              <span className="text-[13px] leading-snug text-text-secondary">
                Type the total to confirm:{' '}
                <span className="num font-medium text-text-primary">{phrase}</span>
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={blocked}
                aria-invalid={confirmText.trim() !== '' && !confirmed}
                placeholder={phrase}
                className="focus-ring num mt-2 h-9 w-full rounded-[6px] border border-border bg-bg-base px-3 text-[13.5px] text-text-primary disabled:opacity-50"
              />
            </label>
          </Card>
        </div>
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-5 rounded-[6px] border border-negative/30 bg-negative-soft px-4 py-3 text-[13.5px] text-negative"
        >
          {submitError === 'Insufficient treasury balance'
            ? `Insufficient treasury balance. The run needs ${usd(debit)} and was not executed.`
            : submitError}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={execute} disabled={!canExecute}>
          Execute payroll · <span className="num">{usd(debit)}</span>{' '}
          <IconArrowRight width={16} height={16} />
        </Button>
      </div>
    </>
  )
}
