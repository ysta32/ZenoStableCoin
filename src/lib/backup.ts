import type { Activity, Member, Method, PayrollRun } from '../data'

export const BACKUP_VERSION = 2

export type Persisted = {
  team: Member[]
  activity: Activity[]
  payrollRuns: PayrollRun[]
  treasuryBalance: number
  treasuryYieldMtd: number
  defaultMethod: Method
}

export type BackupResult = { ok: true; state: Persisted } | { ok: false; error: string }

export function serializeBackup(p: Persisted): string {
  return JSON.stringify(
    { app: 'zeno', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), state: p },
    null,
    2,
  )
}

export function parseBackup(json: string, isValid: (x: unknown) => x is Persisted): BackupResult {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Not valid JSON' }
  }
  if (typeof data !== 'object' || data === null || (data as { app?: unknown }).app !== 'zeno') {
    return { ok: false, error: 'Not a Zeno backup' }
  }
  const env = data as { version?: unknown; state?: unknown }
  if (env.version !== BACKUP_VERSION) return { ok: false, error: 'Unsupported backup version' }
  if (!isValid(env.state)) return { ok: false, error: 'Backup contents are invalid' }
  return { ok: true, state: env.state }
}
