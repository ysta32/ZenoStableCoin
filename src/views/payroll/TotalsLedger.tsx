import type { ReactNode } from 'react'
import { round2, usd } from './ledger'

/** Statement-style totals block: label left, figure right, ruled total line. */
export function TotalsLedger({
  subtotal,
  fee,
  balance,
  recipients,
}: {
  subtotal: number
  fee: number
  balance?: number
  recipients: number
}) {
  const debit = round2(subtotal + fee)
  const after = balance === undefined ? undefined : round2(balance - debit)
  return (
    <dl className="text-[13.5px]">
      <LedgerLine
        label={`Payouts · ${recipients} recipient${recipients === 1 ? '' : 's'}`}
        value={usd(subtotal)}
      />
      <LedgerLine label="Network fee (0.2%)" value={usd(fee)} />
      <LedgerLine label="Total debit" value={usd(debit)} strong />
      {balance !== undefined && after !== undefined && (
        <>
          <LedgerLine label="Treasury balance" value={usd(balance)} muted />
          <LedgerLine
            label="Balance after run"
            value={usd(after)}
            muted
            tone={after < 0 ? 'negative' : undefined}
          />
        </>
      )}
    </dl>
  )
}

function LedgerLine({
  label,
  value,
  strong,
  muted,
  tone,
}: {
  label: ReactNode
  value: string
  strong?: boolean
  muted?: boolean
  tone?: 'negative'
}) {
  return (
    <div
      className={[
        'flex items-baseline justify-between gap-4 py-2',
        strong ? 'mt-1 border-t border-border pt-3 font-medium' : '',
        muted ? 'text-text-secondary' : 'text-text-primary',
      ].join(' ')}
    >
      <dt className={strong ? '' : 'text-text-secondary'}>{label}</dt>
      <dd
        className={`num ${strong ? 'text-[15px]' : ''} ${tone === 'negative' ? 'text-negative' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
