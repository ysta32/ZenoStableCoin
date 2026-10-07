# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-10-07

### Added

- Payroll safety rails: a run is blocked when the treasury cannot cover total plus fee, when a stablecoin recipient has no wallet, or when there are no recipients; duplicate wallets and zero amounts are flagged. Executing now requires typing the exact debit amount, checked before anything is recorded.
- "Demo · simulated funds" badge in the app bar and plain-language disclaimers on the landing page, so nobody mistakes the demo for a live product.
- Your data in Settings: export a JSON backup, import one (validated), or reset the demo data.
- Landing "Built in the open" section linking source, CI, release notes and the security policy.
- Accessibility gate: Playwright + axe-core checks every route against WCAG 2.1 AA in CI, plus a skip-to-content link and reduced-motion support.
- Security headers on production (CSP with a hashed inline script, HSTS, frame-ancestors none, COOP, Referrer-Policy, Permissions-Policy), documented in `docs/SECURITY-HEADERS.md`.
- Hardened validation of saved browser state: size and item limits, EVM wallet format, non-negative balances, prototype-pollution-safe parsing (62 new tests).
- GitHub project hygiene: SECURITY.md with private vulnerability reporting, code of conduct, issue forms, PR template, Dependabot, CODEOWNERS.
- CI hardening (least-privilege permissions, concurrency cancel, format check, `npm audit` on production deps) and a tag-driven release workflow that publishes GitHub Releases with notes from this changelog and a dist archive.

### Changed

- Seeded demo team members now carry placeholder wallet addresses so the sample payroll passes the new rails.
- Public site no longer sits behind Vercel authentication.

## [1.0.0] - 2026-10-07

### Added

- Download page at `/download` with per-platform install steps, source archives, local setup and release history.
- Installable PWA: web app manifest, crafted icons, and an offline service worker whose precache list is generated at build time so each build's HTML and assets cache together.
- Self-hosted Newsreader, Geist and Geist Mono fonts (no third-party font requests).
- Documentation: README with screenshots, architecture guide, changelog, contributing guide and MIT license.
- Social preview image rendered from `scripts/og.mjs`.

### Removed

- Landing page team section.

### Changed

- Install prompt is scoped to the app and its copy describes what installing actually does.

## [0.3.0] - 2026-10-07

### Added

- Editorial landing page rebuilt on the Ledger design system, with a fee calculator and comparison table.
- Real CSV import for payroll, with validated, cent-normalized amounts and a formula-injection guard on exports.
- Recorded payroll runs with receipts and history.
- Working treasury deposit and withdraw; light and dark themes across every view.
- Responsive app shell with sidebar drawer, theme switcher, command palette and toasts.
- Team, Transactions, Reports and Settings split into their own views.
- Playwright smoke suite and deterministic screenshot capture, with an e2e job in CI.

### Fixed

- Decimal-safe cent rounding with regression tests.
- Focus management for the drawer, palette and shortcut dialogs.
- Pre-release honesty pass on copy and consistency.

## [0.2.0] - 2026-10-07

### Added

- Ledger design system tokens, typography and primitives.
- URL routing for every view (History API), with back and forward support.
- Persisted app state in `localStorage` with strict validation.
- ESLint, Prettier, Vitest and GitHub Actions CI, with tested money, CSV and fee modules.

## [0.1.0] - 2026-04-25

### Added

- Original prototype: dashboard, payroll flow, contractor list and mock data.
- Command palette, keyboard shortcuts and a shortcut help overlay.
- Simulated yield accrual and a live activity feed.

[1.0.0]: https://github.com/ysta32/ZenoStableCoin/releases/tag/v1.0.0
[0.3.0]: https://github.com/ysta32/ZenoStableCoin/releases/tag/v0.3.0
[0.2.0]: https://github.com/ysta32/ZenoStableCoin/releases/tag/v0.2.0
[0.1.0]: https://github.com/ysta32/ZenoStableCoin/releases/tag/v0.1.0
