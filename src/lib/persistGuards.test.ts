import { describe, expect, it } from 'vitest'
import {
  EVM_ADDRESS_RE,
  MAX_ITEMS,
  MAX_STATE_BYTES,
  isActivity,
  isEvmAddress,
  isMember,
  isPayrollRun,
  isPersistedState,
  isSafeString,
  parsePersisted,
} from './persistGuards'

const recipient = {
  memberId: 'm1',
  name: 'Ana',
  method: 'USDC',
  amount: 100,
  txHash: '0xabc',
  status: 'sent',
}
const run = {
  id: 'r1',
  clientRunId: 'c1',
  createdAt: 1,
  total: 100,
  fee: 1,
  recipients: [recipient],
}

describe('isPayrollRun', () => {
  it('accepts a well-formed run', () => {
    expect(isPayrollRun(run)).toBe(true)
  })
  it.each([
    ['null recipient', [null]],
    ['bad method', [{ ...recipient, method: 'BTC' }]],
    ['non-finite amount', [{ ...recipient, amount: Infinity }]],
    ['missing txHash', [{ ...recipient, txHash: undefined }]],
    ['unknown status', [{ ...recipient, status: 'pending' }]],
    ['non-string name', [{ ...recipient, name: 5 }]],
  ])('rejects %s', (_label, recipients) => {
    expect(isPayrollRun({ ...run, recipients })).toBe(false)
  })
})

const wallet = `0x${'aB09'.repeat(10)}`
const member = {
  id: 'm1',
  name: 'Ana',
  role: 'Engineer',
  country: 'Portugal',
  countryCode: 'PT',
  method: 'USDC',
  amount: 5000,
  initials: 'AN',
  avatarColor: '#0B5D45',
  wallet,
  email: 'ana@example.com',
}
const activity = {
  id: 'a1',
  type: 'Payroll',
  detail: 'May payroll · 1 contractor',
  amount: -5000,
  date: 'May 31',
  createdAt: 1,
}
const state = {
  team: [member],
  activity: [activity],
  payrollRuns: [run],
  treasuryBalance: 100_000,
  treasuryYieldMtd: 12.5,
  defaultMethod: 'USDC',
}

describe('constants', () => {
  it('exposes the documented limits', () => {
    expect(MAX_STATE_BYTES).toBe(1_000_000)
    expect(MAX_ITEMS).toBe(5000)
    expect(EVM_ADDRESS_RE.test(wallet)).toBe(true)
  })
})

describe('isEvmAddress', () => {
  it('accepts a 0x + 40 hex address', () => {
    expect(isEvmAddress(wallet)).toBe(true)
  })
  it.each([
    ['too short', '0x1234'],
    ['too long', `${wallet}0`],
    ['no prefix', 'aB09'.repeat(10) + 'ab'],
    ['non-hex', `0x${'g'.repeat(40)}`],
    ['trailing newline', `${wallet}\n`],
    ['non-string', 42],
    ['undefined', undefined],
  ])('rejects %s', (_label, value) => {
    expect(isEvmAddress(value)).toBe(false)
  })
})

describe('isSafeString', () => {
  it('enforces the default 256 limit', () => {
    expect(isSafeString('a'.repeat(256))).toBe(true)
    expect(isSafeString('a'.repeat(257))).toBe(false)
  })
  it('honours a custom limit', () => {
    expect(isSafeString('abcd', 3)).toBe(false)
    expect(isSafeString('abc', 3)).toBe(true)
  })
  it('rejects non-strings', () => {
    expect(isSafeString(1)).toBe(false)
    expect(isSafeString(null)).toBe(false)
  })
})

describe('isMember', () => {
  it('accepts a full member and one without optional fields', () => {
    expect(isMember(member)).toBe(true)
    const { wallet: _w, email: _e, ...bare } = member
    expect(isMember(bare)).toBe(true)
  })
  it.each([
    ['bad wallet', { wallet: '0xnotanaddress' }],
    ['empty wallet', { wallet: '' }],
    ['non-string wallet', { wallet: 123 }],
    ['long email', { email: `${'a'.repeat(250)}@example.com` }],
    ['long name', { name: 'a'.repeat(257) }],
    ['long role', { role: 'a'.repeat(257) }],
    ['long country', { country: 'a'.repeat(257) }],
    ['bad method', { method: 'BTC' }],
    ['non-finite amount', { amount: NaN }],
    ['missing id', { id: undefined }],
  ])('rejects %s', (_label, patch) => {
    expect(isMember({ ...member, ...patch })).toBe(false)
  })
  it('rejects non-objects', () => {
    expect(isMember(null)).toBe(false)
    expect(isMember([member])).toBe(false)
  })
})

describe('isActivity', () => {
  it('accepts a valid activity with and without createdAt', () => {
    expect(isActivity(activity)).toBe(true)
    const { createdAt: _c, ...noCreated } = activity
    expect(isActivity(noCreated)).toBe(true)
  })
  it.each([
    ['unknown type', { type: 'Refund' }],
    ['non-string detail', { detail: 5 }],
    ['non-finite amount', { amount: Infinity }],
    ['non-numeric createdAt', { createdAt: '1' }],
    ['missing date', { date: undefined }],
  ])('rejects %s', (_label, patch) => {
    expect(isActivity({ ...activity, ...patch })).toBe(false)
  })
})

describe('isPersistedState', () => {
  it('accepts a valid full state', () => {
    expect(isPersistedState(state)).toBe(true)
  })
  it('accepts empty collections and zero balance', () => {
    expect(
      isPersistedState({ ...state, team: [], activity: [], payrollRuns: [], treasuryBalance: 0 }),
    ).toBe(true)
  })
  it.each([
    ['negative balance', { treasuryBalance: -1 }],
    ['non-finite balance', { treasuryBalance: Infinity }],
    ['non-finite yield', { treasuryYieldMtd: NaN }],
    ['bad default method', { defaultMethod: 'BTC' }],
    ['team not an array', { team: {} }],
    ['bad member', { team: [{ ...member, wallet: '0x123' }] }],
    ['bad activity', { activity: [{ ...activity, type: 'Nope' }] }],
    ['bad run', { payrollRuns: [{ ...run, fee: 'x' }] }],
  ])('rejects %s', (_label, patch) => {
    expect(isPersistedState({ ...state, ...patch })).toBe(false)
  })
  it.each(['team', 'activity', 'payrollRuns'] as const)(
    'rejects %s longer than MAX_ITEMS',
    (key) => {
      const item = { team: member, activity, payrollRuns: run }[key]
      expect(isPersistedState({ ...state, [key]: Array(MAX_ITEMS).fill(item) })).toBe(true)
      expect(isPersistedState({ ...state, [key]: Array(MAX_ITEMS + 1).fill(item) })).toBe(false)
    },
  )
  it('rejects a payroll run with more than MAX_ITEMS recipients', () => {
    const big = { ...run, recipients: Array(MAX_ITEMS + 1).fill(recipient) }
    expect(isPayrollRun(big)).toBe(false)
  })
})

describe('parsePersisted', () => {
  it('returns null for missing input', () => {
    expect(parsePersisted(null)).toBeNull()
  })
  it('round-trips a valid full state', () => {
    expect(parsePersisted(JSON.stringify(state))).toEqual(state)
  })
  it('rejects invalid JSON', () => {
    expect(parsePersisted('{not json')).toBeNull()
    expect(parsePersisted('')).toBeNull()
  })
  it('rejects valid JSON of the wrong shape', () => {
    expect(parsePersisted('null')).toBeNull()
    expect(parsePersisted('[]')).toBeNull()
    expect(parsePersisted('"x"')).toBeNull()
  })
  it('rejects an oversize payload before parsing', () => {
    const json = JSON.stringify(state)
    const padded = json + ' '.repeat(MAX_STATE_BYTES - json.length + 1)
    expect(padded.length).toBe(MAX_STATE_BYTES + 1)
    expect(parsePersisted(padded)).toBeNull()
    const jsonBytes = new TextEncoder().encode(json).length
    const atLimit = json + ' '.repeat(MAX_STATE_BYTES - jsonBytes)
    expect(new TextEncoder().encode(atLimit).length).toBe(MAX_STATE_BYTES)
    expect(parsePersisted(atLimit)).toEqual(state)
  })
  it('measures size in UTF-8 bytes, not characters', () => {
    const json = JSON.stringify(state)
    // Each "é" is 1 UTF-16 unit but 2 UTF-8 bytes.
    const filler = MAX_STATE_BYTES - json.length
    const multi = JSON.stringify({ ...state, pad: 'é'.repeat(filler) })
    expect(multi.length).toBeLessThan(MAX_STATE_BYTES + 20)
    expect(new TextEncoder().encode(multi).length).toBeGreaterThan(MAX_STATE_BYTES)
    expect(parsePersisted(multi)).toBeNull()
  })
  it('rejects state with more than MAX_ITEMS entries', () => {
    const tooMany = { ...state, activity: Array(MAX_ITEMS + 1).fill(activity) }
    expect(parsePersisted(JSON.stringify(tooMany))).toBeNull()
  })
  it('rejects a bad wallet', () => {
    const bad = { ...state, team: [{ ...member, wallet: '0xdeadbeef' }] }
    expect(parsePersisted(JSON.stringify(bad))).toBeNull()
  })
  it('rejects a negative balance', () => {
    expect(parsePersisted(JSON.stringify({ ...state, treasuryBalance: -0.01 }))).toBeNull()
  })
  it('ignores prototype-pollution keys without throwing or altering prototypes', () => {
    const json = JSON.stringify(state)
    const memberJson = JSON.stringify(member)
    const raw = json
      .replace(
        /^\{/,
        '{"__proto__":{"polluted":true,"treasuryBalance":-5},"constructor":{"prototype":{"polluted":true}},',
      )
      .replace(memberJson, memberJson.replace(/^\{/, '{"__proto__":{"isAdmin":true},'))
    expect(raw).toContain('__proto__')
    let result: ReturnType<typeof parsePersisted> = null
    expect(() => {
      result = parsePersisted(raw)
    }).not.toThrow()
    expect(result).toEqual(state)
    const parsed = result as unknown as Record<string, unknown>
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype)
    expect(Object.prototype.hasOwnProperty.call(parsed, '__proto__')).toBe(false)
    expect(parsed.polluted).toBeUndefined()
    const firstMember = (parsed.team as Record<string, unknown>[])[0]
    expect(Object.getPrototypeOf(firstMember)).toBe(Object.prototype)
    expect(Object.prototype.hasOwnProperty.call(firstMember, '__proto__')).toBe(false)
    expect(firstMember.isAdmin).toBeUndefined()
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(({} as Record<string, unknown>).isAdmin).toBeUndefined()
  })
  it('returns only known top-level keys', () => {
    const result = parsePersisted(JSON.stringify({ ...state, extra: 'ignored' }))
    expect(result).not.toBeNull()
    expect(Object.keys(result ?? {}).sort()).toEqual(Object.keys(state).sort())
  })
})
