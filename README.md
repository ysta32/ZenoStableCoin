# Zeno

Stablecoin payroll for founders paying contractors across time zones. Fund once, pay everyone in USDC or USDT, and let idle cash earn yield in the meantime.

**Live demo:** https://zeno-stable-coin.vercel.app

![Zeno's Run Payroll screen: set amounts per contractor, paid in USDC, USDT, or EUR bank](image.png)

> **Heads up: this is a front-end prototype.** Everything runs in your browser on mock data from `src/data.ts`. There's no backend, no wallet, no blockchain calls, and no real money moves. The API snippet, the SOC 2 claim, and the fee and competitor numbers on the landing page are pitch copy, not working features.

## What it does

- **Landing** (`/`): the pitch. How it works, features, a comparison with Deel, Wise, and SWIFT, a sample API call, and buttons into the app.
- **Dashboard** (`/app`): treasury balance, yield, monthly payroll, a growth sparkline, the next scheduled run, and recent activity.
- **Payroll**: the main event. Three steps:
  1. **Set amounts.** Edit each contractor's USD amount, add or remove people, or hit "Import CSV" (it loads a built-in sample set).
  2. **Review & confirm.** Simulated checks tick off, then you tick the authorize box.
  3. **Execute.** A scripted run (validating, compliance, minting, distributing) flips each person from Processing to Sent. Confetti at the end.
- **Treasury**: balance, yield, and allocation (T-bill tokens, USDC, USDT). The balance drifts a little every few seconds so it feels live. Deposit and Withdraw just show demo toasts.
- **Team**, **Transactions**, **Reports**, **Settings**: lighter screens that live together in `src/views/Simple.tsx`. Transactions and Reports export real CSV files, built from the mock data. Settings has a "Reset demo" button.

## How it works

- **One context for all state.** `src/context/AppContext.tsx` holds the route, the current view, the team, the payroll step, treasury numbers, the activity feed, and toasts. Views read and write through `useApp()`.
- **Your team sticks around.** Team edits save to `localStorage` (`zeno.team`). Everything else resets on reload.
- **A fake-but-lively economy.** Timers nudge the treasury balance every 3 to 5 seconds, tick yield every 12 seconds, and drop a new "yield accrued" entry into the feed about every 70 seconds.
- **Command palette.** Press `⌘K` / `Ctrl+K` to jump to any view, start a payroll run, reset the demo, or go back to the landing page. Arrow keys and Enter work.
- **Keyboard shortcuts.** Press `g`, then a letter: `g d` Dashboard, `g p` Payroll, `g y` Treasury, `g t` Team, `g x` Transactions, `g r` Reports, `g s` Settings. Press `?` for the cheat sheet.
- **Count-up numbers.** `useCountUp` eases stats up from zero with `requestAnimationFrame`, and can wait until the number scrolls into view. It respects `prefers-reduced-motion`.
- **Fast navigation.** Views are lazy-loaded. Hovering a sidebar item or a "Launch app" button prefetches the code before you click.
- **Small touches.** Framer Motion page transitions, `canvas-confetti` on payroll success, and an error boundary that can clear saved data and start fresh if something breaks.
- **Routing without a router.** `/` shows the landing page and `/app` shows the app, using the History API. `vercel.json` rewrites every path to `index.html`, so refreshes work.

## Tech

React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, canvas-confetti. Deployed on Vercel.

## Run it

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build to dist/
npm run preview   # serve the production build locally
```

## The business idea

B2B SaaS: a payroll and treasury tool for small, remote-first companies. This prototype shows what using it would feel like. It doesn't build the payment side.
