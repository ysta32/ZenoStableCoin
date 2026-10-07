# Architecture

Zeno is a single-page React app with no backend. Everything is mock data held in the browser.

## State

`src/context/AppContext.tsx` is the only store. `useApp()` exposes the route, current view, team, payroll step and runs, treasury numbers, activity feed, theme and toasts, plus the actions that change them.

Persistence is `localStorage` under `zeno.state.v2`. On load the stored JSON is validated field by field with guards in `src/lib/persistGuards.ts` (`isObj`, `isFiniteNum`, `isMethod`, and `isPayrollRun`, which also requires every recipient to pass `isPayrollRecipient`: string `memberId`, `name` and `txHash`, a known `method`, a finite `amount`, and status `sent` or `failed`); anything malformed is discarded and defaults are used. The theme lives separately in `zeno.theme`. "Reset demo" and the error boundary's recovery action remove the saved state.

## Routing

There is no router library. The route is derived from `window.location.pathname` (`/`, `/download`, `/app`, `/app/<view>`, otherwise not found). Navigation calls `history.pushState`, and a `popstate` listener keeps back and forward working. `vercel.json` rewrites unknown paths to `index.html` so deep links and refreshes work. Views are lazy-loaded and prefetched on hover (`src/preload.ts`).

## Payroll

The flow is amounts, review, execute (`src/views/payroll/`). `ledger.tsx` holds the money rules: amounts are normalized to cents with decimal-safe rounding, validated against a maximum, and the fee is a fixed rate on the subtotal. Each run gets a `clientRunId`; recording a run in `AppContext` is idempotent on that id, so a retried or double-submitted run never debits the treasury twice. Completed runs are stored with receipts and shown in the history, and a receipt can be downloaded.

## Library (`src/lib/`)

- `money.ts`: USD formatting that is safe for NaN, rounded negatives and compact values.
- `csv.ts`: CSV serialization with a formula-injection guard, and `parseTeamCsv` for imports (rows carry their source line, errors are reported per line).
- `fees.ts`: provider fee model and annual cost estimate behind the landing calculator.
- `installPrompt.ts`: captures `beforeinstallprompt` for the download page.

`money`, `csv`, `fees` and `persistGuards` have unit tests beside them; `installPrompt` does not.

## PWA

`public/manifest.webmanifest` and the icons in `public/icons/` make the app installable. `public/sw.js` is an offline service worker. Its source contains placeholders that the `zeno-sw-precache` plugin in `vite.config.ts` fills in after the build: the list of emitted `/assets/*` files and a version hash of the HTML plus that list. Because the cache name includes that hash, each build precaches its HTML and hashed assets as one unit, and old caches are removed on activate. Fonts are self-hosted and bundled by Vite.

## Testing and CI

- Vitest runs `src/**/*.test.ts` (money, CSV, fees, payroll ledger).
- Playwright (`e2e/`) runs a smoke suite and `screenshots.spec.ts`, which captures the images in `docs/screenshots/` with a frozen clock and seeded randomness.
- `.github/workflows/ci.yml` runs `npm run check` and `npm run build` in one job and `npm run e2e` in another, on every push and pull request.

See [DESIGN.md](DESIGN.md) for the visual system.
