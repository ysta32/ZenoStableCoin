const REPO_URL = 'https://github.com/ysta32/ZenoStableCoin'

export type Release = {
  /** Git tag, e.g. "v1.0.0". */
  tag: string
  /** ISO date (YYYY-MM-DD) the tag was published. */
  date: string
  title: string
  summary: string
  notes: string[]
}

/** Newest first. Every tag here exists on GitHub. */
export const RELEASES: Release[] = [
  {
    tag: 'v1.0.0',
    date: '2026-10-07',
    title: 'Installable app and download page',
    summary: 'Zeno installs as a standalone app, and the source has a proper home at /download.',
    notes: [
      'Install Zeno from Chrome, Edge or Safari as a standalone app window.',
      'New download page with per-platform install steps, source archives and release history.',
      'One-click deploy to Vercel; documented settings for any static host.',
    ],
  },
  {
    tag: 'v0.3.0',
    date: '2026-10-07',
    title: 'Ledger redesign',
    summary:
      'Editorial landing page, working treasury, real CSV payroll runs and a responsive app shell.',
    notes: [
      'Landing page rebuilt on the Ledger design system, with a fee calculator and comparison table.',
      'Payroll accepts CSV imports, validates amounts to the cent and keeps a history of runs with receipts.',
      'Treasury deposits and withdrawals work; light and dark themes across every view.',
    ],
  },
  {
    tag: 'v0.2.0',
    date: '2026-10-07',
    title: 'Foundation',
    summary: 'Design tokens, URL routing, persisted state and a tested utility library.',
    notes: [
      'Every view has its own URL, and browser back and forward walk the history.',
      'Team, activity and treasury state persist locally between visits.',
      'ESLint, Prettier, Vitest and CI, with tests for money formatting and CSV parsing.',
    ],
  },
  {
    tag: 'v0.1.0',
    date: '2026-04-25',
    title: 'Original prototype',
    summary:
      'The first clickable demo: dashboard, payroll flow, command palette and mock activity.',
    notes: [
      'Clickable dashboard, payroll flow and contractor list with mock data.',
      'Command palette and keyboard navigation between views.',
      'Simulated yield accrual and a live activity feed.',
    ],
  },
]

export const LATEST = RELEASES[0]

export const archiveUrl = (tag: string, ext: 'zip' | 'tar.gz') =>
  `${REPO_URL}/archive/refs/tags/${tag}.${ext}`
export const releaseUrl = (tag: string) => `${REPO_URL}/releases/tag/${tag}`
export const RELEASES_URL = `${REPO_URL}/releases`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-10-07" -> "7 Oct 2026", without timezone drift from Date parsing. */
export function formatReleaseDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
