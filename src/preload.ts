import type { View } from './context/AppContext'

export const preloadView: Record<View, () => Promise<unknown>> = {
  dashboard: () => import('./views/Dashboard'),
  payroll: () => import('./views/Payroll'),
  treasury: () => import('./views/Treasury'),
  team: () => import('./views/Team'),
  transactions: () => import('./views/Transactions'),
  reports: () => import('./views/Reports'),
  settings: () => import('./views/Settings'),
}
