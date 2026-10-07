import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button, Pill, LiveDot } from '../components/UI'
import { IconPlus, IconCheck } from '../components/Icons'
import { useApp } from '../context/AppContext'
import { TopBar } from '../components/TopBar'
import type { PayrollRun } from '../data'
import { StepAmounts } from './payroll/StepAmounts'
import { StepReview } from './payroll/StepReview'
import { StepExecute } from './payroll/StepExecute'
import { History } from './payroll/History'

const STEPS = ['Set amounts', 'Review', 'Execute'] as const

export function Payroll() {
  const { payrollStep, setPayrollStep, goToPayroll, isExecuting, toast, payrollRuns } = useApp()
  const reduce = useReducedMotion()
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  // Run id whose settlement walkthrough has finished (null id = no run to show).
  const [finishedRun, setFinishedRun] = useState<{ id: string | null } | null>(null)
  const onFinished = useCallback((id: string | null) => setFinishedRun({ id }), [])

  // If the view remounted mid-run, the most recent recorded run is the one being executed.
  const activeRun: PayrollRun | undefined =
    payrollStep === 2
      ? (activeRunId ? payrollRuns.find((r) => r.id === activeRunId) : undefined) ?? payrollRuns[0]
      : undefined

  // Context marks the whole Execute step as executing; once the run has settled, allow a new run.
  const running = isExecuting && !(finishedRun && finishedRun.id === (activeRun?.id ?? null))

  const restart = () => {
    if (running) {
      toast('Wait for payroll to finish before restarting', 'amber')
      return
    }
    setActiveRunId(null)
    setFinishedRun(null)
    goToPayroll()
  }

  const onExecuted = (run: PayrollRun) => {
    setActiveRunId(run.id)
    setPayrollStep(2)
  }

  const runAnother = () => {
    setActiveRunId(null)
    setFinishedRun(null)
    goToPayroll()
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Payroll">
        <Pill tone="positive" className="hidden h-7 px-2.5 sm:inline-flex">
          <LiveDot /> Live · USDC/USDT
        </Pill>
        <Button
          variant="primary"
          onClick={restart}
          disabled={running}
          title={running ? 'Wait for payroll to finish' : 'Restart from step 1'}
        >
          <IconPlus width={14} height={14} /> {payrollStep === 0 ? 'New run' : 'Restart'}
        </Button>
      </TopBar>

      <nav aria-label="Payroll steps" className="border-b border-border-subtle bg-bg-base px-4 pt-5 sm:px-8">
        <ol className="grid grid-cols-3 gap-2 sm:gap-4">
          {STEPS.map((s, i) => {
            const active = i === payrollStep
            const done = i < payrollStep
            return (
              <li key={s} aria-current={active ? 'step' : undefined} className="flex min-w-0 flex-col">
                <div className="flex min-w-0 items-center gap-2.5 pb-3.5">
                  <span
                    className={[
                      'num flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] transition-colors duration-150',
                      active
                        ? 'border-brand-500 text-brand-500'
                        : done
                          ? 'border-brand-500 bg-brand-500 text-text-inverse'
                          : 'border-border text-text-muted',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {done ? <IconCheck width={12} height={12} /> : i + 1}
                  </span>
                  <span
                    className={[
                      'truncate text-[13px]',
                      active ? 'font-medium text-text-primary' : done ? 'text-text-primary' : 'text-text-muted',
                      active ? '' : 'hidden sm:inline',
                    ].join(' ')}
                  >
                    {s}
                    {done && <span className="sr-only"> (completed)</span>}
                  </span>
                </div>
                <div className={`h-[2px] ${active || done ? 'bg-brand-500' : 'bg-border-subtle'}`} aria-hidden="true" />
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 sm:py-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={payrollStep}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {payrollStep === 0 && <StepAmounts onNext={() => setPayrollStep(1)} />}
            {payrollStep === 1 && <StepReview onBack={() => setPayrollStep(0)} onExecuted={onExecuted} />}
            {payrollStep === 2 && <StepExecute run={activeRun} onRestart={runAnother} onFinished={onFinished} />}
          </motion.div>
        </AnimatePresence>
        {payrollStep !== 1 && <History />}
      </div>
    </div>
  )
}
