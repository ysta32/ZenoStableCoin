import { describe, expect, it } from 'vitest'
import { BACKUP_VERSION, parseBackup, serializeBackup, type Persisted } from './backup'

const sample: Persisted = {
  team: [],
  activity: [],
  payrollRuns: [],
  treasuryBalance: 1234.5,
  treasuryYieldMtd: 10,
  defaultMethod: 'USDC',
}
const isValid = (x: unknown): x is Persisted =>
  typeof x === 'object' && x !== null && typeof (x as Persisted).treasuryBalance === 'number'

describe('backup', () => {
  it('round-trips state', () => {
    const json = serializeBackup(sample)
    const env = JSON.parse(json)
    expect(env.app).toBe('zeno')
    expect(env.version).toBe(BACKUP_VERSION)
    expect(Number.isNaN(Date.parse(env.exportedAt))).toBe(false)
    expect(parseBackup(json, isValid)).toEqual({ ok: true, state: sample })
  })
  it('rejects invalid JSON', () => {
    expect(parseBackup('{nope', isValid)).toEqual({ ok: false, error: 'Not valid JSON' })
  })
  it('rejects non-Zeno payloads', () => {
    for (const raw of ['null', '[]', '5', JSON.stringify({ app: 'other', version: 2, state: sample })]) {
      expect(parseBackup(raw, isValid)).toEqual({ ok: false, error: 'Not a Zeno backup' })
    }
  })
  it('rejects unsupported versions', () => {
    const raw = JSON.stringify({ app: 'zeno', version: 1, state: sample })
    expect(parseBackup(raw, isValid)).toEqual({ ok: false, error: 'Unsupported backup version' })
  })
  it('rejects invalid contents', () => {
    const raw = JSON.stringify({ app: 'zeno', version: 2, state: { treasuryBalance: 'x' } })
    expect(parseBackup(raw, isValid)).toEqual({ ok: false, error: 'Backup contents are invalid' })
  })
})
