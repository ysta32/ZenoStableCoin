import { Suspense, lazy, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp, View } from './context/AppContext'
import { Sidebar } from './components/Sidebar'
import { ToastHost } from './components/Toast'
import { CommandPalette } from './components/CommandPalette'
import { ShortcutHelp } from './components/ShortcutHelp'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './views/NotFound'

const Landing = lazy(() => import('./views/Landing').then((m) => ({ default: m.Landing })))
const Dashboard = lazy(() => import('./views/Dashboard').then((m) => ({ default: m.Dashboard })))
const Payroll = lazy(() => import('./views/Payroll').then((m) => ({ default: m.Payroll })))
const Treasury = lazy(() => import('./views/Treasury').then((m) => ({ default: m.Treasury })))
const Team = lazy(() => import('./views/Simple').then((m) => ({ default: m.Team })))
const Transactions = lazy(() => import('./views/Simple').then((m) => ({ default: m.Transactions })))
const Reports = lazy(() => import('./views/Simple').then((m) => ({ default: m.Reports })))
const Settings = lazy(() => import('./views/Simple').then((m) => ({ default: m.Settings })))

function ViewFallback() {
  return <div className="h-full bg-bg-base" />
}

const navMap: Record<string, View> = {
  d: 'dashboard',
  p: 'payroll',
  y: 'treasury',
  t: 'team',
  x: 'transactions',
  r: 'reports',
  s: 'settings',
}

function useNavShortcuts() {
  const { setView, paletteOpen, route } = useApp()
  const lastG = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paletteOpen || route !== 'app') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return

      const now = Date.now()
      if (e.key === 'g' || e.key === 'G') {
        lastG.current = now
        return
      }
      if (now - lastG.current < 1200) {
        const v = navMap[e.key.toLowerCase()]
        if (v) {
          e.preventDefault()
          setView(v)
          lastG.current = 0
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setView, paletteOpen, route])
}

function Shell() {
  const { route, view } = useApp()
  useNavShortcuts()

  return (
    <AnimatePresence mode="wait">
      {route === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<div className="h-screen bg-bg-base" />}>
            <Landing />
          </Suspense>
        </motion.div>
      ) : route === 'notfound' ? (
        <motion.div
          key="notfound"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <NotFound />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-screen w-screen overflow-hidden bg-bg-base"
        >
          <Sidebar />
          <main className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="h-full"
              >
                <Suspense fallback={<ViewFallback />}>
                  {view === 'dashboard' && <Dashboard />}
                  {view === 'payroll' && <Payroll />}
                  {view === 'treasury' && <Treasury />}
                  {view === 'team' && <Team />}
                  {view === 'transactions' && <Transactions />}
                  {view === 'reports' && <Reports />}
                  {view === 'settings' && <Settings />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Shell />
        <CommandPalette />
        <ShortcutHelp />
        <ToastHost />
      </AppProvider>
    </ErrorBoundary>
  )
}
