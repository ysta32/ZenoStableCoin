import type { Member } from '../data'

type TeamRow = Pick<Member, 'name' | 'role' | 'country' | 'countryCode' | 'method' | 'amount'> & {
  line: number
  wallet?: string
  email?: string
}
type CsvError = { line: number; message: string }

const PLAIN_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

/**
 * Spreadsheet apps evaluate cells starting with = + - @ TAB or CR as formulas.
 * Prefix such text with an apostrophe; plain numbers (including negatives) pass through.
 */
function neutralizeFormula(cell: string | number): string {
  const value = String(cell)
  if (typeof cell === 'number' || PLAIN_NUMBER.test(value)) return value
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = neutralizeFormula(cell)
          return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(','),
    )
    .join('\r\n')
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  try {
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    URL.revokeObjectURL(url)
  }
}

export function isEvmAddress(s: string): boolean {
  return s.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(s)
}

function readRecords(text: string): {
  records: { cells: string[]; line: number }[]
  errors: CsvError[]
} {
  const records: { cells: string[]; line: number }[] = []
  const errors: CsvError[] = []
  let cells: string[] = []
  let field = ''
  let state: 'start' | 'plain' | 'quoted' | 'closed' = 'start'
  let line = 1
  let startLine = 1
  let invalid = false
  const finishRecord = () => {
    cells.push(field)
    if (!invalid && (cells.length > 1 || cells[0].trim() !== '')) {
      records.push({ cells, line: startLine })
    }
    cells = []
    field = ''
    state = 'start'
    invalid = false
  }
  const malformed = () => {
    if (!invalid) errors.push({ line: startLine, message: 'Malformed CSV quoting' })
    invalid = true
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (state === 'quoted') {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else state = 'closed'
      } else {
        field += char
        if (char === '\n' || (char === '\r' && text[i + 1] !== '\n')) line++
      }
    } else if (char === ',') {
      cells.push(field)
      field = ''
      state = 'start'
    } else if (char === '\r' || char === '\n') {
      finishRecord()
      if (char === '\r' && text[i + 1] === '\n') i++
      line++
      startLine = line
    } else if (char === '"' && state === 'start') {
      state = 'quoted'
    } else {
      if (char === '"' || state === 'closed') malformed()
      field += char
      state = 'plain'
    }
  }
  if (state === 'quoted') {
    errors.push({ line: startLine, message: 'Unterminated quoted field' })
  } else finishRecord()
  return { records, errors }
}

export function parseTeamCsv(text: string): { rows: TeamRow[]; errors: CsvError[] } {
  const { records, errors } = readRecords(text.replace(/^\uFEFF/, ''))
  const rows: TeamRow[] = []
  const header = records.shift()
  if (!header || errors.some((error) => error.line < header.line)) {
    errors.push({ line: 1, message: 'Missing or invalid CSV header' })
    return { rows, errors }
  }
  const columns = header.cells.map((cell) => cell.trim().toLowerCase())
  const required = ['name', 'role', 'country', 'country_code', 'method', 'amount']
  for (const column of required) {
    if (!columns.includes(column)) {
      errors.push({ line: header.line, message: `Missing required column: ${column}` })
    }
  }
  if (new Set(columns).size !== columns.length) {
    errors.push({ line: header.line, message: 'Duplicate column names' })
  }
  if (errors.some((error) => error.line === header.line)) return { rows, errors }

  for (const record of records) {
    const value = (name: string) => record.cells[columns.indexOf(name)]?.trim() ?? ''
    const reject = (message: string) => errors.push({ line: record.line, message })
    if (record.cells.length !== columns.length) {
      reject('Row has a different number of columns than the header')
      continue
    }
    const missing = required.filter((column) => !value(column))
    if (missing.length) {
      reject(`Missing required value: ${missing.join(', ')}`)
      continue
    }
    const method = value('method')
    if (method !== 'USDC' && method !== 'USDT' && method !== 'EUR Bank') {
      reject('Method must be USDC, USDT, or EUR Bank')
      continue
    }
    const rawAmount = value('amount')
    const amount = Number(rawAmount)
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawAmount) || !Number.isFinite(amount) || amount < 0) {
      reject('Amount must be a finite, non-negative decimal number')
      continue
    }
    rows.push({
      line: record.line,
      name: value('name'),
      role: value('role'),
      country: value('country'),
      countryCode: value('country_code'),
      method,
      amount,
      ...(value('wallet') ? { wallet: value('wallet') } : {}),
      ...(value('email') ? { email: value('email') } : {}),
    })
  }
  return { rows, errors: errors.sort((a, b) => a.line - b.line) }
}
