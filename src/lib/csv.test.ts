import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv, isEvmAddress, parseTeamCsv, toCsv } from './csv'

const header = 'name,role,country,country_code,method,amount'
const row = 'Ana,Engineer,Brazil,BR,USDC,4200'

describe('toCsv', () => {
  it('serializes numbers and empty cells with CRLF records', () => {
    expect(toCsv([['Name', 'Amount'], ['Ana', 42], ['', 0]])).toBe('Name,Amount\r\nAna,42\r\n,0')
  })
  it('quotes commas and doubles embedded quotes', () => {
    expect(toCsv([['Last, First', 'A "quote"']])).toBe('"Last, First","A ""quote"""')
  })
  it('quotes both CR and LF', () => {
    expect(toCsv([['a\rb', 'a\nb']])).toBe('"a\rb","a\nb"')
  })
  it('handles no rows', () => expect(toCsv([])).toBe(''))
})

describe('parseTeamCsv', () => {
  it('parses a complete row and numeric amount', () => {
    expect(parseTeamCsv(`${header}\n${row}`)).toEqual({
      rows: [{ line: 2, name: 'Ana', role: 'Engineer', country: 'Brazil', countryCode: 'BR', method: 'USDC', amount: 4200 }],
      errors: [],
    })
  })
  it('handles BOM, CRLF and a trailing newline', () => {
    const result = parseTeamCsv(`\uFEFF${header}\r\n${row}\r\n`)
    expect(result.rows).toHaveLength(1)
    expect(result.errors).toEqual([])
  })
  it('matches headers case-insensitively and independently of order', () => {
    const result = parseTeamCsv(' AMOUNT ,METHOD,Country_Code,COUNTRY,ROLE,NAME\n42,USDT,BR,Brazil,Engineer,Ana')
    expect(result.rows[0]).toMatchObject({ name: 'Ana', method: 'USDT', amount: 42 })
    expect(result.errors).toEqual([])
  })
  it('reads quoted commas and escaped quotes', () => {
    const result = parseTeamCsv(`${header}\n"Silva, Ana","Lead ""Engineer""",Brazil,BR,USDC,42`)
    expect(result.rows[0]).toMatchObject({ name: 'Silva, Ana', role: 'Lead "Engineer"' })
    expect(result.errors).toEqual([])
  })
  it('preserves embedded CRLF and reports physical line numbers', () => {
    const result = parseTeamCsv(`${header}\r\n"Ana\r\nSilva",Engineer,Brazil,BR,USDC,42\r\nBob,Dev,US,US,BTC,42`)
    expect(result.rows[0].name).toBe('Ana\r\nSilva')
    expect(result.errors).toEqual([{ line: 4, message: 'Method must be USDC, USDT, or EUR Bank' }])
  })
  it('imports optional wallet and email fields', () => {
    const wallet = `0x${'a'.repeat(40)}`
    expect(parseTeamCsv(`${header},wallet,email\n${row},${wallet},ana@example.com`).rows[0])
      .toMatchObject({ wallet, email: 'ana@example.com' })
  })
  it.each(['\n', '\r\n', '\r'])('tracks record start lines after multiline fields with %j', (newline) => {
    const result = parseTeamCsv(`${header}${newline}"Ana${newline}Silva",Engineer,Brazil,BR,USDC,42${newline}${row}`)
    expect(result.rows.map(({ line }) => line)).toEqual([2, 4])
    expect(result.errors).toEqual([])
  })
  it('omits blank optional fields', () => {
    const result = parseTeamCsv(`${header},wallet,email\n${row},,`)
    expect(result.rows[0]).not.toHaveProperty('wallet')
    expect(result.rows[0]).not.toHaveProperty('email')
  })
  it.each(['USDC', 'USDT', 'EUR Bank'])('accepts method %s', (method) => {
    const result = parseTeamCsv(`${header}\n${row.replace('USDC', method)}`)
    expect(result.rows[0].method).toBe(method)
    expect(result.errors).toEqual([])
  })
  it('rejects missing required columns', () => {
    const result = parseTeamCsv('name,amount\nAna,42')
    expect(result.rows).toEqual([])
    expect(result.errors).toContainEqual({ line: 1, message: 'Missing required column: method' })
  })
  it('rejects duplicate case-insensitive headers', () => {
    expect(parseTeamCsv(`${header},NAME\n${row},Ana`).errors).toContainEqual({ line: 1, message: 'Duplicate column names' })
  })
  it.each(['-1', 'NaN', 'Infinity', 'abc', '0x10', '1e3', ''])('rejects invalid amount %s', (amount) => {
    const result = parseTeamCsv(`${header}\n${row.replace('4200', amount)}`)
    expect(result.rows).toEqual([])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].line).toBe(2)
  })
  it.each(['0', '12.34', '.5'])('accepts non-negative decimal %s', (amount) => {
    expect(parseTeamCsv(`${header}\n${row.replace('4200', amount)}`).rows[0].amount).toBe(Number(amount))
  })
  it('rejects an unsupported method while preserving valid rows', () => {
    const result = parseTeamCsv(`${header}\n${row.replace('USDC', 'BTC')}\n${row}`)
    expect(result.rows).toHaveLength(1)
    expect(result.errors[0].line).toBe(2)
  })
  it.each([`${row},extra`, 'Ana,Engineer,Brazil,BR,USDC'])('rejects mismatched row width', (value) => {
    const result = parseTeamCsv(`${header}\n${value}`)
    expect(result.rows).toEqual([])
    expect(result.errors[0].message).toMatch(/number of columns/)
  })
  it('rejects empty required values', () => {
    expect(parseTeamCsv(`${header}\n${row.replace('Ana', '')}`).errors[0].message).toContain('name')
  })
  it('ignores blank lines', () => {
    expect(parseTeamCsv(`${header}\n\n${row}\n \n`).rows).toHaveLength(1)
  })
  it('reports an empty document', () => {
    expect(parseTeamCsv('').errors).toEqual([{ line: 1, message: 'Missing or invalid CSV header' }])
  })
  it('accepts a header-only document', () => {
    expect(parseTeamCsv(header)).toEqual({ rows: [], errors: [] })
  })
  it.each(['"Ana', 'A"na,Engineer,Brazil,BR,USDC,42', '"Ana"x,Engineer,Brazil,BR,USDC,42'])('reports malformed quotes', (value) => {
    const result = parseTeamCsv(`${header}\n${value}`)
    expect(result.rows).toEqual([])
    expect(result.errors[0].line).toBe(2)
  })
  it('does not mistake data for a malformed header', () => {
    const result = parseTeamCsv(`na"me,role,country,country_code,method,amount\n${row}`)
    expect(result.rows).toEqual([])
    expect(result.errors[0].line).toBe(1)
  })
  it('round-trips escaped fields through the serializer', () => {
    const result = parseTeamCsv(toCsv([header.split(','), ['Ana, "A"', 'Dev\nLead', 'Brazil', 'BR', 'USDC', 42.5]]))
    expect(result.rows[0]).toMatchObject({ name: 'Ana, "A"', role: 'Dev\nLead', amount: 42.5 })
    expect(result.errors).toEqual([])
  })
})

describe('isEvmAddress', () => {
  it('accepts hexadecimal addresses in either case', () => {
    expect(isEvmAddress(`0x${'aB09'.repeat(10)}`)).toBe(true)
  })
  it.each(['', '0x123', `0x${'a'.repeat(41)}`, `0x${'g'.repeat(40)}`, 'a'.repeat(40), ` 0x${'a'.repeat(40)}`, `0x${'a'.repeat(40)}\n`])('rejects malformed address %j', (value) => {
    expect(isEvmAddress(value)).toBe(false)
  })
})

describe('downloadCsv', () => {
  afterEach(() => vi.unstubAllGlobals())
  it.each([false, true])('cleans up its URL and anchor (click throws: %s)', (throws) => {
    const anchor = { href: '', download: '', click: vi.fn(() => { if (throws) throw new Error('click failed') }), remove: vi.fn() }
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    const appendChild = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.stubGlobal('document', { createElement: vi.fn(() => anchor), body: { appendChild } })
    if (throws) expect(() => downloadCsv('team.csv', [['Ana', 42]])).toThrow('click failed')
    else downloadCsv('team.csv', [['Ana', 42]])
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(anchor.download).toBe('team.csv')
    expect(anchor.href).toBe('blob:test')
    expect(appendChild).toHaveBeenCalledWith(anchor)
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(anchor.remove).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})
