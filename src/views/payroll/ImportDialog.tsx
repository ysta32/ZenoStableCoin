import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button, MethodBadge } from '../../components/UI'
import { IconDownload, IconX } from '../../components/Icons'
import { useApp } from '../../context/AppContext'
import type { Member } from '../../data'
import { isEvmAddress, parseTeamCsv } from '../../lib/csv'
import { amountError, usd } from './ledger'

type ParsedRow = ReturnType<typeof parseTeamCsv>['rows'][number]
type PreviewEntry = { line: number; row?: ParsedRow; error?: string }
type Mode = 'append' | 'replace'

const MAX_FILE_BYTES = 1_000_000
const SAMPLE_URL = '/sample-team.csv'
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'
  )
}

function rowError(row: ParsedRow): string | null {
  const amt = amountError(row.amount)
  if (amt) return amt
  if (row.wallet && !isEvmAddress(row.wallet)) return 'Wallet is not a valid 0x address'
  return null
}

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return createPortal(<ImportDialogBody onClose={onClose} />, document.body)
}

function ImportDialogBody({ onClose }: { onClose: () => void }) {
  const { team, addMember, replaceTeam, toast } = useApp()
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [entries, setEntries] = useState<PreviewEntry[] | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('append')
  const [dragging, setDragging] = useState(false)
  const readSeq = useRef(0)

  // Move focus into the dialog, lock page scroll, restore focus on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !dialogRef.current) return
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.tabIndex >= 0 && (el.offsetParent !== null || el === document.activeElement),
    )
    if (items.length === 0) return
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

  const readFile = async (file: File) => {
    const seq = ++readSeq.current
    setFileName(file.name)
    setEntries(null)
    setFileError(null)
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setFileError('Choose a .csv file')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('File is larger than 1 MB')
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      if (seq === readSeq.current) setFileError('Could not read the file')
      return
    }
    if (seq !== readSeq.current) return
    const { rows, errors } = parseTeamCsv(text)
    const list: PreviewEntry[] = [
      ...rows.map((row) => ({ line: row.line, row, error: rowError(row) ?? undefined })),
      ...errors.map((e) => ({ line: e.line, error: e.message })),
    ].sort((a, b) => a.line - b.line)
    if (list.length === 0) {
      setFileError('The file has a header but no rows')
      return
    }
    setEntries(list)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void readFile(file)
  }

  const valid = useMemo(
    () => (entries ?? []).filter((e): e is PreviewEntry & { row: ParsedRow } => !!e.row && !e.error),
    [entries],
  )
  const invalidCount = (entries?.length ?? 0) - valid.length
  const importTotal = valid.reduce((s, e) => s + e.row.amount, 0)

  const confirm = () => {
    if (valid.length === 0) return
    const toMember = (r: ParsedRow): Partial<Member> => ({
      name: r.name,
      role: r.role,
      country: r.country,
      countryCode: r.countryCode.toUpperCase(),
      method: r.method,
      amount: r.amount,
      ...(r.wallet ? { wallet: r.wallet } : {}),
      ...(r.email ? { email: r.email } : {}),
    })
    if (mode === 'append') {
      valid.forEach((e) => addMember(toMember(e.row)))
    } else {
      const stamp = Date.now().toString(36)
      replaceTeam(
        valid.map((e, i) => ({
          ...(toMember(e.row) as Omit<Member, 'id' | 'initials' | 'avatarColor'>),
          id: `imp_${stamp}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          initials: initialsOf(e.row.name),
          avatarColor: '',
        })),
      )
    }
    const n = valid.length
    toast(
      `${mode === 'append' ? 'Added' : 'Replaced team with'} ${n} member${n === 1 ? '' : 's'} from ${fileName ?? 'CSV'}`,
      'green',
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-text-primary/30" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        className="relative flex max-h-[92vh] w-full max-w-[720px] flex-col rounded-t-[14px] border border-border-subtle bg-bg-surface shadow-pop sm:rounded-[14px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="font-display text-[22px] leading-tight text-text-primary">
              Import team from CSV
            </h2>
            <p id={descId} className="mt-1 text-[13px] text-text-secondary">
              Columns: name, role, country, country_code, method, amount. Optional: wallet, email.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import dialog"
            className="focus-ring -mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] text-text-muted hover:bg-bg-inset hover:text-text-primary"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={[
              'flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed px-4 py-7 text-center transition-colors duration-150',
              dragging ? 'border-brand-500 bg-brand-50' : 'border-border bg-bg-inset',
            ].join(' ')}
          >
            <div className="text-[13.5px] text-text-primary">
              {fileName ? (
                <>
                  <span className="text-text-secondary">Selected:</span> <span className="num">{fileName}</span>
                </>
              ) : (
                'Drop a .csv file here, or choose one'
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                {fileName ? 'Choose another file' : 'Choose file'}
              </Button>
              <a
                href={SAMPLE_URL}
                download="sample-team.csv"
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              >
                <IconDownload width={14} height={14} /> Download sample CSV
              </a>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void readFile(file)
                e.target.value = ''
              }}
            />
          </div>

          {fileError && (
            <p role="alert" className="mt-4 rounded-[6px] bg-negative-soft px-3 py-2 text-[13px] text-negative">
              {fileError}
            </p>
          )}

          {entries && (
            <div className="mt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-text-primary">Preview</h3>
                <p className="text-[12.5px] text-text-secondary" aria-live="polite">
                  <span className="num">{valid.length}</span> ready
                  {invalidCount > 0 && (
                    <>
                      {' · '}
                      <span className="num text-negative">{invalidCount}</span>
                      <span className="text-negative"> with errors, skipped</span>
                    </>
                  )}
                </p>
              </div>
              <ul className="mt-3 divide-y divide-border-subtle overflow-hidden rounded-[10px] border border-border-subtle">
                {entries.map((e, i) => (
                  <li
                    key={`${e.line}-${i}`}
                    className={`flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 ${e.error ? 'bg-negative-soft/60' : ''}`}
                  >
                    <span className="num w-14 shrink-0 text-[11.5px] text-text-muted">Line {e.line}</span>
                    {e.row ? (
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="min-w-0 truncate text-[13px] font-medium text-text-primary">{e.row.name}</span>
                        <span className="text-[12px] text-text-muted">
                          {e.row.role} · {e.row.countryCode.toUpperCase()}
                        </span>
                        <MethodBadge method={e.row.method} />
                        <span className="num ml-auto text-[13px] text-text-primary">{usd(e.row.amount)}</span>
                      </div>
                    ) : (
                      <span className="flex-1 text-[13px] text-text-secondary">Row not parsed</span>
                    )}
                    {e.error && <span className="text-[12px] text-negative sm:max-w-[40%] sm:text-right">{e.error}</span>}
                  </li>
                ))}
              </ul>

              <fieldset className="mt-5">
                <legend className="text-[14px] font-semibold text-text-primary">How should these be added?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <ModeOption
                    checked={mode === 'append'}
                    onChange={() => setMode('append')}
                    title="Append to team"
                    detail={`Keeps the ${team.length} current member${team.length === 1 ? '' : 's'}.`}
                  />
                  <ModeOption
                    checked={mode === 'replace'}
                    onChange={() => setMode('replace')}
                    title="Replace team"
                    detail={`Removes the ${team.length} current member${team.length === 1 ? '' : 's'}.`}
                  />
                </div>
              </fieldset>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[12.5px] text-text-secondary">
            {valid.length > 0 ? (
              <>
                Adds <span className="num text-text-primary">{usd(importTotal)}</span> to this payroll
              </>
            ) : (
              'Nothing to import yet'
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button variant="primary" onClick={confirm} disabled={valid.length === 0} className="flex-1 sm:flex-none">
              {mode === 'replace' ? 'Replace with' : 'Import'} {valid.length || ''} member{valid.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModeOption({
  checked,
  onChange,
  title,
  detail,
}: {
  checked: boolean
  onChange: () => void
  title: string
  detail: string
}) {
  return (
    <label
      className={[
        'flex cursor-pointer items-start gap-3 rounded-[6px] border px-3 py-2.5 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg-surface',
        checked ? 'border-brand-500 bg-brand-50' : 'border-border hover:bg-bg-elevated',
      ].join(' ')}
    >
      <input
        type="radio"
        name="import-mode"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 accent-brand-500 focus:outline-none"
      />
      <span>
        <span className="block text-[13.5px] font-medium text-text-primary">{title}</span>
        <span className="block text-[12.5px] text-text-secondary">{detail}</span>
      </span>
    </label>
  )
}
