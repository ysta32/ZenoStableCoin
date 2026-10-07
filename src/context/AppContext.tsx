import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { parseBackup, serializeBackup, type Persisted } from '../lib/backup'
import { isFiniteNum, isMethod, isObj, isPayrollRun } from '../lib/persistGuards'
import {
  team as seedTeam,
  treasury as seedTreasury,
  recentActivity as seedActivity,
  Member,
  Method,
  Activity,
  ActivityType,
  PayrollRun,
  PayrollRunInput,
  Theme,
} from '../data'

export type { Activity, PayrollRun, PayrollRunInput, PayrollRecipient, Theme } from '../data'

export type View =
  'dashboard' | 'payroll' | 'treasury' | 'team' | 'transactions' | 'reports' | 'settings'
export type Route = 'landing' | 'app' | 'download' | 'notfound'

const VIEWS: readonly View[] = [
  'dashboard',
  'payroll',
  'treasury',
  'team',
  'transactions',
  'reports',
  'settings',
]
const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Dashboard',
  payroll: 'Payroll',
  treasury: 'Treasury',
  team: 'Team',
  transactions: 'Transactions',
  reports: 'Reports',
  settings: 'Settings',
}
const BASE_TITLE = 'Zeno — Stablecoin payroll for global teams'
const STATE_KEY = 'zeno.state.v2'
const LEGACY_TEAM_KEY = 'zeno.team'
const THEME_KEY = 'zeno.theme'
const SAVE_DEBOUNCE_MS = 300

type Loc = { route: Route; view: View }

function parseLocation(pathname: string): Loc {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return { route: 'landing', view: 'dashboard' }
  if (path === '/app') return { route: 'app', view: 'dashboard' }
  if (path === '/download') return { route: 'download', view: 'dashboard' }
  const m = /^\/app\/([^/]+)$/.exec(path)
  if (m && (VIEWS as readonly string[]).includes(m[1])) return { route: 'app', view: m[1] as View }
  return { route: 'notfound', view: 'dashboard' }
}

const pathForView = (v: View) => (v === 'dashboard' ? '/app' : `/app/${v}`)

const isOptStr = (x: unknown) => x === undefined || typeof x === 'string'
const isMember = (x: unknown): x is Member =>
  isObj(x) &&
  typeof x.id === 'string' &&
  typeof x.name === 'string' &&
  typeof x.role === 'string' &&
  typeof x.country === 'string' &&
  typeof x.countryCode === 'string' &&
  isMethod(x.method) &&
  isFiniteNum(x.amount) &&
  typeof x.initials === 'string' &&
  typeof x.avatarColor === 'string' &&
  isOptStr(x.wallet) &&
  isOptStr(x.email)
const ACTIVITY_TYPES: readonly string[] = [
  'Payroll',
  'Yield',
  'Deposit',
  'Swap',
  'Withdrawal',
] satisfies ActivityType[]
const isActivity = (x: unknown): x is Activity =>
  isObj(x) &&
  typeof x.id === 'string' &&
  typeof x.type === 'string' &&
  ACTIVITY_TYPES.includes(x.type) &&
  typeof x.detail === 'string' &&
  typeof x.date === 'string' &&
  isFiniteNum(x.amount) &&
  (x.createdAt === undefined || isFiniteNum(x.createdAt))
const arrayOf = <T,>(x: unknown, guard: (v: unknown) => v is T): T[] | null =>
  Array.isArray(x) && x.every(guard) ? (x as T[]) : null
const isPersisted = (x: unknown): x is Persisted =>
  isObj(x) &&
  arrayOf(x.team, isMember) !== null &&
  arrayOf(x.activity, isActivity) !== null &&
  arrayOf(x.payrollRuns, isPayrollRun) !== null &&
  isFiniteNum(x.treasuryBalance) &&
  x.treasuryBalance >= 0 &&
  isFiniteNum(x.treasuryYieldMtd) &&
  isMethod(x.defaultMethod)

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function seedState(): Persisted {
  return {
    team: seedTeam,
    activity: seedActivity,
    payrollRuns: [],
    treasuryBalance: seedTreasury.balance,
    treasuryYieldMtd: seedTreasury.yieldMtd,
    defaultMethod: 'USDC',
  }
}

function loadPersisted(): Persisted {
  const seed = seedState()
  const v2 = readJson(STATE_KEY)
  if (isObj(v2)) {
    return {
      team: arrayOf(v2.team, isMember) ?? seed.team,
      activity: arrayOf(v2.activity, isActivity) ?? seed.activity,
      payrollRuns: arrayOf(v2.payrollRuns, isPayrollRun) ?? seed.payrollRuns,
      treasuryBalance:
        isFiniteNum(v2.treasuryBalance) && v2.treasuryBalance >= 0
          ? v2.treasuryBalance
          : seed.treasuryBalance,
      treasuryYieldMtd: isFiniteNum(v2.treasuryYieldMtd)
        ? v2.treasuryYieldMtd
        : seed.treasuryYieldMtd,
      defaultMethod: isMethod(v2.defaultMethod) ? v2.defaultMethod : seed.defaultMethod,
    }
  }
  const legacyTeam = arrayOf(readJson(LEGACY_TEAM_KEY), isMember)
  if (legacyTeam && legacyTeam.length) return { ...seed, team: legacyTeam }
  return seed
}

function savePersisted(s: Persisted) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(s))
    // Legacy key is fully migrated once v2 is written.
    window.localStorage.removeItem(LEGACY_TEAM_KEY)
  } catch {
    // Storage unavailable (private mode / quota) — state stays in memory only.
  }
}

function loadTheme(): Theme {
  try {
    const t = window.localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch {}
  return 'light'
}

const round2 = (n: number) => Math.round(n * 100) / 100
const genId = (prefix = '') => prefix + String(Date.now()) + Math.random().toString(36).slice(2, 6)
const todayLabel = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function fakeTxHash(): string {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return '0x' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

type Toast = { id: number; msg: string; tone?: 'neutral' | 'green' | 'amber' }

export function formatActivityDate(a: Activity, now: number = Date.now()): string {
  if (!a.createdAt) return a.date
  const elapsed = now - a.createdAt
  if (elapsed < 5_000) return 'Just now'
  if (elapsed < 60_000) return `${Math.floor(elapsed / 1000)}s ago`
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`
  return a.date
}

type Ctx = {
  route: Route
  navigate: (r: Route) => void
  view: View
  setView: (v: View) => void
  goToPayroll: () => void

  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void

  team: Member[]
  replaceTeam: (members: Member[]) => void
  defaultMethod: Method
  setDefaultMethod: (m: Method) => void
  setAmount: (id: string, amount: number) => void
  addMember: (m: Partial<Member>) => string
  updateMember: (id: string, patch: Partial<Member>) => void
  removeMember: (id: string) => void

  payrollStep: 0 | 1 | 2
  setPayrollStep: (s: 0 | 1 | 2) => void
  authorized: boolean
  setAuthorized: (v: boolean) => void
  isExecuting: boolean

  treasuryBalance: number
  treasuryYieldMtd: number
  activity: Activity[]
  addTransaction: (tx: Omit<Activity, 'id'> & { id?: string }) => void
  deposit: (amount: number, source: string) => void
  withdraw: (amount: number, destination: string) => boolean
  payrollRuns: PayrollRun[]
  recordPayrollRun: (input: PayrollRunInput) => PayrollRun

  theme: Theme
  setTheme: (t: Theme) => void

  toasts: Toast[]
  toast: (msg: string, tone?: 'neutral' | 'green' | 'amber') => void
  dismissToast: (id: number) => void

  paletteOpen: boolean
  setPaletteOpen: (v: boolean) => void

  resetDemo: () => void
  exportState: () => string
  importState: (json: string) => { ok: true } | { ok: false; error: string }
}

const AppCtx = createContext<Ctx | null>(null)

export function useApp() {
  const v = useContext(AppCtx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}

const randAvatarColor = () => {
  const pool = [
    'bg-emerald-600',
    'bg-sky-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-teal-600',
    'bg-indigo-600',
  ]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<Loc>(() => parseLocation(window.location.pathname))
  const { route, view } = loc
  const [initial] = useState<Persisted>(loadPersisted)
  const [team, setTeam] = useState<Member[]>(initial.team)
  const [defaultMethod, setDefaultMethod] = useState<Method>(initial.defaultMethod)
  const [payrollStep, setPayrollStep] = useState<0 | 1 | 2>(0)
  const [authorized, setAuthorized] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setThemeState] = useState<Theme>(loadTheme)

  const [treasuryBalance, setTreasuryBalance] = useState(initial.treasuryBalance)
  const [treasuryYieldMtd, setTreasuryYieldMtd] = useState(initial.treasuryYieldMtd)
  const [activity, setActivity] = useState<Activity[]>(initial.activity)
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(initial.payrollRuns)
  const [paletteOpen, setPaletteOpen] = useState(false)
  // Target the drift timer walks toward; every real balance change moves it too
  // so the random walk never pulls a deposit/withdrawal back out.
  const balanceTargetRef = useRef(initial.treasuryBalance)
  // Synchronous mirrors used for validation inside callbacks (withdraw/payroll),
  // updated immediately on every commit and re-synced from state after render.
  const balanceRef = useRef(initial.treasuryBalance)
  const payrollRunsRef = useRef<PayrollRun[]>(initial.payrollRuns)

  useEffect(() => {
    balanceRef.current = treasuryBalance
  }, [treasuryBalance])

  useEffect(() => {
    payrollRunsRef.current = payrollRuns
  }, [payrollRuns])

  // Debounced persistence of the versioned state blob, flushed on page hide.
  const snapshotRef = useRef<Persisted>(initial)
  useEffect(() => {
    snapshotRef.current = {
      team,
      activity,
      payrollRuns,
      treasuryBalance,
      treasuryYieldMtd,
      defaultMethod,
    }
    const id = window.setTimeout(() => savePersisted(snapshotRef.current), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [team, activity, payrollRuns, treasuryBalance, treasuryYieldMtd, defaultMethod])

  useEffect(() => {
    const flush = () => savePersisted(snapshotRef.current)
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

  // Theme: html.dark for 'dark', or 'system' while the OS prefers dark.
  useLayoutEffect(() => {
    const root = document.documentElement
    const mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && !!mq?.matches)
      root.classList.toggle('dark', dark)
      root.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    if (theme !== 'system' || !mq) return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try {
      window.localStorage.setItem(THEME_KEY, t)
    } catch {}
  }, [])

  // Random-walk treasury balance toward a moving target every 3–5s
  useEffect(() => {
    let timer: number
    const schedule = () => {
      const delay = 3000 + Math.random() * 2000
      timer = window.setTimeout(() => {
        setTreasuryBalance((b) => {
          const drift = (Math.random() - 0.5) * 100
          const target = balanceTargetRef.current + (Math.random() - 0.5) * 100
          return Math.max(0, round2(b + (target - b) * 0.6 + drift * 0.2))
        })
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  // Yield ticks every 12s — visible during a demo
  useEffect(() => {
    const id = window.setInterval(() => {
      setTreasuryYieldMtd((v) => round2(v + 0.5 + Math.random() * 1.5))
    }, 12000)
    return () => clearInterval(id)
  }, [])

  const navigate = useCallback((r: Route) => {
    const path =
      r === 'app'
        ? '/app'
        : r === 'landing'
          ? '/'
          : r === 'download'
            ? '/download'
            : window.location.pathname
    if (window.location.pathname !== path) window.history.pushState({ route: r }, '', path)
    setLoc({ route: r, view: 'dashboard' })
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    const onPop = () => {
      const next = parseLocation(window.location.pathname)
      setLoc(next)
      setSidebarOpen(false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Switching between landing / app / not-found always starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [route])

  useEffect(() => {
    if (route === 'landing') document.title = BASE_TITLE
    else if (route === 'download') document.title = 'Download · Zeno'
    else if (route === 'notfound') document.title = 'Page not found · Zeno'
    else document.title = `${VIEW_LABELS[view]} · Zeno`
  }, [route, view])

  const setView = useCallback((v: View) => {
    const path = pathForView(v)
    if (window.location.pathname !== path)
      window.history.pushState({ route: 'app', view: v }, '', path)
    setLoc({ route: 'app', view: v })
    setSidebarOpen(false)
  }, [])

  const goToPayroll = useCallback(() => {
    setView('payroll')
    setPayrollStep(0)
    setAuthorized(false)
  }, [setView])

  const setAmount = useCallback((id: string, amount: number) => {
    setTeam((t) => t.map((m) => (m.id === id ? { ...m, amount } : m)))
  }, [])

  const addMember = useCallback(
    (m: Partial<Member>) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 6)
      const initials =
        (m.name || '')
          .split(' ')
          .map((s) => s[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || '??'
      const newMember: Member = {
        id,
        name: m.name ?? '',
        role: m.role ?? 'Contractor',
        country: m.country ?? 'United States',
        countryCode: m.countryCode ?? 'US',
        method: m.method && isMethod(m.method) ? m.method : defaultMethod,
        amount: m.amount ?? 3000,
        initials,
        avatarColor: m.avatarColor ?? randAvatarColor(),
        ...(m.wallet !== undefined ? { wallet: m.wallet } : {}),
        ...(m.email !== undefined ? { email: m.email } : {}),
      }
      setTeam((t) => [...t, newMember])
      return id
    },
    [defaultMethod],
  )

  const replaceTeam = useCallback((members: Member[]) => {
    setTeam([...members])
  }, [])

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    setTeam((t) =>
      t.map((m) => {
        if (m.id !== id) return m
        const next = { ...m, ...patch }
        if (patch.name !== undefined) {
          next.initials =
            patch.name
              .split(' ')
              .map((s) => s[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || '??'
        }
        return next
      }),
    )
  }, [])

  const removeMember = useCallback((id: string) => {
    setTeam((t) => t.filter((m) => m.id !== id))
  }, [])

  const addTransaction = useCallback((tx: Omit<Activity, 'id'> & { id?: string }) => {
    const id = tx.id ?? String(Date.now()) + Math.random().toString(36).slice(2, 6)
    const createdAt = tx.createdAt ?? Date.now()
    setActivity((a) => [{ ...tx, id, createdAt }, ...a].slice(0, 80))
    balanceTargetRef.current = Math.max(0, round2(balanceTargetRef.current + tx.amount))
    balanceRef.current = Math.max(0, round2(balanceRef.current + tx.amount))
    setTreasuryBalance((b) => Math.max(0, round2(b + tx.amount)))
  }, [])

  // Live yield event every ~70s — adds a new "Yield · accrued" entry so the
  // activity feed feels alive during the demo, not just during a payroll.
  useEffect(() => {
    const id = window.setInterval(() => {
      const amt = Math.round(20 + Math.random() * 60)
      addTransaction({
        type: 'Yield',
        detail: 'T-bill token yield · accrued',
        amount: amt,
        date: todayLabel(),
      })
    }, 70000)
    return () => clearInterval(id)
  }, [addTransaction])

  const toast = useCallback((msg: string, tone: 'neutral' | 'green' | 'amber' = 'neutral') => {
    const id = Date.now() + Math.random()
    setToasts((ts) => [...ts, { id, msg, tone }])
    window.setTimeout(() => {
      setToasts((ts) => ts.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const deposit = useCallback(
    (amount: number, source: string) => {
      if (!Number.isFinite(amount) || amount <= 0) return
      const amt = round2(amount)
      addTransaction({
        type: 'Deposit',
        detail: `Deposit from ${source}`,
        amount: amt,
        date: todayLabel(),
      })
      toast(`Deposited ${usd(amt)} from ${source}`, 'green')
    },
    [addTransaction, toast],
  )

  const withdraw = useCallback(
    (amount: number, destination: string): boolean => {
      if (!Number.isFinite(amount) || amount <= 0 || amount > balanceRef.current) return false
      const amt = round2(amount)
      addTransaction({
        type: 'Withdrawal',
        detail: `Withdrawal to ${destination}`,
        amount: -amt,
        date: todayLabel(),
      })
      toast(`Withdrew ${usd(amt)} to ${destination}`, 'green')
      return true
    },
    [addTransaction, toast],
  )

  const recordPayrollRun = useCallback(
    (input: PayrollRunInput): PayrollRun => {
      // Idempotent on clientRunId: a retried/double-submitted run never debits twice.
      const existing = payrollRunsRef.current.find((r) => r.clientRunId === input.clientRunId)
      if (existing) return existing
      if (
        !Number.isFinite(input.total) ||
        !Number.isFinite(input.fee) ||
        input.total < 0 ||
        input.fee < 0
      ) {
        throw new Error('Invalid payroll amounts')
      }
      const debit = round2(input.total + input.fee)
      if (debit > balanceRef.current) throw new Error('Insufficient treasury balance')
      const createdAt = Date.now()
      const run: PayrollRun = {
        id: genId('run_'),
        clientRunId: input.clientRunId,
        createdAt,
        total: input.total,
        fee: input.fee,
        recipients: input.recipients.map((r) => ({ ...r, txHash: r.txHash || fakeTxHash() })),
      }
      // Commit the ref first so a second call in the same tick sees this run.
      payrollRunsRef.current = [run, ...payrollRunsRef.current]
      setPayrollRuns((rs) => [run, ...rs.filter((r) => r.clientRunId !== run.clientRunId)])
      const month = new Date(createdAt).toLocaleString('en-US', { month: 'long' })
      const n = run.recipients.length
      addTransaction({
        id: `act_${run.id}`,
        type: 'Payroll',
        detail: `${month} payroll · ${n} contractor${n === 1 ? '' : 's'}`,
        amount: -debit,
        date: todayLabel(),
        createdAt,
      })
      return run
    },
    [addTransaction],
  )

  const applyState = useCallback((p: Persisted) => {
    setTeam(p.team)
    setPayrollStep(0)
    setAuthorized(false)
    setActivity(p.activity)
    setPayrollRuns(p.payrollRuns)
    payrollRunsRef.current = p.payrollRuns
    setDefaultMethod(p.defaultMethod)
    setTreasuryBalance(p.treasuryBalance)
    setTreasuryYieldMtd(p.treasuryYieldMtd)
    balanceTargetRef.current = p.treasuryBalance
    balanceRef.current = p.treasuryBalance
    snapshotRef.current = p
    savePersisted(p)
  }, [])

  const resetDemo = useCallback(() => {
    applyState(seedState())
    toast('Demo reset', 'green')
  }, [applyState, toast])

  const exportState = useCallback(
    () =>
      serializeBackup({
        team,
        activity,
        payrollRuns,
        treasuryBalance,
        treasuryYieldMtd,
        defaultMethod,
      }),
    [team, activity, payrollRuns, treasuryBalance, treasuryYieldMtd, defaultMethod],
  )

  const importState = useCallback(
    (json: string): { ok: true } | { ok: false; error: string } => {
      const res = parseBackup(json, isPersisted)
      if (!res.ok) return res
      applyState(res.state)
      toast('Backup imported', 'green')
      return { ok: true }
    },
    [applyState, toast],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToasts([])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isExecuting = view === 'payroll' && payrollStep === 2

  const value = useMemo<Ctx>(
    () => ({
      route,
      navigate,
      view,
      setView,
      goToPayroll,
      sidebarOpen,
      setSidebarOpen,
      team,
      replaceTeam,
      defaultMethod,
      setDefaultMethod,
      setAmount,
      addMember,
      updateMember,
      removeMember,
      payrollStep,
      setPayrollStep,
      authorized,
      setAuthorized,
      isExecuting,
      treasuryBalance,
      treasuryYieldMtd,
      activity,
      addTransaction,
      deposit,
      withdraw,
      payrollRuns,
      recordPayrollRun,
      theme,
      setTheme,
      toasts,
      toast,
      dismissToast,
      paletteOpen,
      setPaletteOpen,
      resetDemo,
      exportState,
      importState,
    }),
    [
      route,
      navigate,
      view,
      setView,
      goToPayroll,
      sidebarOpen,
      team,
      replaceTeam,
      defaultMethod,
      setAmount,
      addMember,
      updateMember,
      removeMember,
      payrollStep,
      authorized,
      isExecuting,
      treasuryBalance,
      treasuryYieldMtd,
      activity,
      addTransaction,
      deposit,
      withdraw,
      payrollRuns,
      recordPayrollRun,
      theme,
      setTheme,
      toasts,
      toast,
      dismissToast,
      paletteOpen,
      resetDemo,
      exportState,
      importState,
    ],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
