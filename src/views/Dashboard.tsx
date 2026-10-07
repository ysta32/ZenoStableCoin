import { useMemo } from 'react'
import { Card, Pill, LiveDot, Button, Avatar, MethodBadge } from '../components/UI'
import { treasury } from '../data'
import { IconArrowRight, IconBolt } from '../components/Icons'
import { useApp, formatActivityDate } from '../context/AppContext'
import { TopBar } from '../components/TopBar'
import { ActivityIcon } from '../components/ActivityIcon'
import { Sparkline } from '../components/Sparkline'
import { formatUSD } from '../lib/money'

export function Dashboard() {
  const { team, setView, goToPayroll, treasuryBalance, treasuryYieldMtd, activity, payrollRuns } =
    useApp()
  const monthly = team.reduce((s, m) => s + m.amount, 0)
  const recent = activity.slice(0, 4)
  const nextPayroll = useMemo(() => {
    const now = new Date()
    const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const label = eom.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const days = Math.max(0, Math.ceil((eom.getTime() - now.getTime()) / 86_400_000))
    const inLabel = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`
    return { label, inLabel }
  }, [])
  return (
    <div className="flex h-full min-w-0 flex-col text-text-primary [&_h1]:font-display [&_h1]:text-[30px] [&_h1]:font-normal">
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Your operating cash, at a glance.</p>
            <p className="mt-1 text-xs text-text-muted">Demo workspace · all amounts in USD</p>
          </div>
          <Button onClick={goToPayroll}>
            <IconBolt width={14} height={14} /> Run payroll
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Treasury balance"
            valueEl={formatUSD(treasuryBalance)}
            sub={`${formatUSD(treasuryYieldMtd, { sign: true })} this month`}
            subTone="green"
          />
          <Stat label="Yield (APY)" valueEl={`${treasury.apy.toFixed(1)}%`} sub="Auto-compounded" />
          <Stat
            label="Monthly payroll"
            valueEl={formatUSD(monthly)}
            sub={`${team.length} contractor${team.length === 1 ? '' : 's'}`}
          />
          <Stat label="Avg settlement" valueEl={<>&lt; 3 min</>} sub="0.2% fee" subTone="green" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="min-w-0 p-5 sm:p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl">Treasury growth</h2>
                <div className="text-[12px] text-text-muted">
                  Illustrative history · including yield
                </div>
              </div>
              <Pill tone="positive">
                <LiveDot /> Demo
              </Pill>
            </div>
            <Sparkline
              values={[245000, 268000, 282000, 325000, 358000, 392140]}
              label="Illustrative treasury balance, last six months"
            />
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl">Next payroll</h2>
            <div className="num mt-3 text-[28px] font-semibold tracking-tight">{formatUSD(monthly)}</div>
            <div className="text-[12.5px] text-text-secondary">
              Month end · {nextPayroll.label}{' '}
              <span className="text-text-muted">· {nextPayroll.inLabel}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {team.slice(0, 5).map((m) => (
                <div key={m.id} className="ring-2 ring-bg-surface rounded-full">
                  <Avatar initials={m.initials} color={m.avatarColor} size={32} />
                </div>
              ))}
              {team.length > 5 && (
                <span className="num text-xs text-text-secondary">+{team.length - 5}</span>
              )}
            </div>
            <p className="mt-3 text-xs text-text-muted">
              {team.length} contractor{team.length === 1 ? '' : 's'} · review before sending
            </p>
            {payrollRuns[0] && (
              <p className="mt-3 border-t border-border-subtle pt-3 text-xs leading-relaxed text-text-secondary">
                Last run ·{' '}
                {new Date(payrollRuns[0].createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · <span className="num">{formatUSD(payrollRuns[0].total)}</span>
              </p>
            )}
            <Button variant="secondary" className="mt-5 w-full" onClick={goToPayroll}>
              Review payroll <IconArrowRight width={14} height={14} />
            </Button>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="min-w-0 overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <h3 className="font-display text-xl">Team</h3>
              <Button variant="ghost" size="sm" onClick={() => setView('team')}>
                View team <IconArrowRight width={12} height={12} />
              </Button>
            </div>
            <ul>
              {team.length === 0 && (
                <li className="px-6 py-8 text-sm text-text-muted">
                  Add your first contractor to prepare payroll.
                </li>
              )}
              {team.map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-2 items-center gap-x-3 gap-y-2 sm:grid-cols-[1.6fr_1fr_0.8fr_1fr] border-b border-border-subtle px-6 py-3 last:border-b-0"
                >
                  <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                    <Avatar initials={m.initials} color={m.avatarColor} size={32} />
                    <div className="min-w-0 break-words">
                      <div className="break-words text-[13.5px] font-medium">
                        {m.name || 'Unnamed'}
                      </div>
                      <div className="text-[12px] text-text-muted">{m.role}</div>
                    </div>
                  </div>
                  <div className="text-[13px] text-text-secondary">{m.country}</div>
                  <div className="text-right sm:text-left">
                    <MethodBadge method={m.method} />
                  </div>
                  <div className="num col-span-2 text-right text-[13px] sm:col-span-1">
                    {formatUSD(m.amount)}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <h3 className="font-display text-xl">Recent activity</h3>
              <Button variant="ghost" size="sm" onClick={() => setView('transactions')}>
                View all <IconArrowRight width={12} height={12} />
              </Button>
            </div>
            <ul>
              {recent.length === 0 && (
                <li className="px-6 py-8 text-sm text-text-muted">
                  Your treasury activity will appear here.
                </li>
              )}
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-b border-border-subtle px-6 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-md ${a.amount >= 0 ? 'bg-positive-soft text-positive' : 'bg-bg-inset text-text-secondary'}`}
                    >
                      <ActivityIcon type={a.type} />
                    </span>
                    <div>
                      <div className="text-[13px] font-medium">{a.type}</div>
                      <div className="text-[11.5px] text-text-muted">{formatActivityDate(a)}</div>
                    </div>
                  </div>
                  <div
                    className={`num text-[13px] ${a.amount >= 0 ? 'text-positive' : 'text-text-primary'}`}
                  >
                    {formatUSD(a.amount, { sign: true })}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  valueEl,
  sub,
  subTone = 'muted',
}: {
  label: string
  valueEl: React.ReactNode
  sub: string
  subTone?: 'muted' | 'green'
}) {
  return (
    <Card className="p-5">
      <div className="text-[12px] text-text-muted">{label}</div>
      <div className="num mt-3 text-[26px] font-semibold tracking-tight">{valueEl}</div>
      <div
        className={`num mt-2 text-[11px] ${subTone === 'green' ? 'text-positive' : 'text-text-muted'}`}
      >
        {sub}
      </div>
    </Card>
  )
}
