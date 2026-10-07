# Zeno design system: "Ledger"

A private bank's statement crossed with a well-set editorial page. Calm, precise, typographic.

## Themes

Light is the default. Dark is enabled by the `dark` class on `<html>`. Tokens live as RGB channel
triplets on `:root` / `:root.dark` in `src/styles.css`; Tailwind maps them with
`rgb(var(--token) / <alpha-value>)`, so opacity modifiers (`bg-brand-500/10`) work.

The user's choice is stored in `localStorage['zeno.theme']` (`light` | `dark` | `system`). An inline
script in `index.html` applies `html.dark` before first paint.

## Color tokens

| Tailwind token | CSS var | Light | Dark | Use |
|---|---|---|---|---|
| `bg-base` | `--bg-base` | #F6F5F1 | #0F1110 | Page background (paper) |
| `bg-surface` | `--bg-surface` | #FFFFFF | #151817 | Cards, tables |
| `bg-elevated` | `--bg-elevated` | #FBFAF8 | #1B1E1D | Hover rows, popovers |
| `bg-sidebar` | `--bg-sidebar` | #F0EEE8 | #121514 | App sidebar |
| `bg-inset` | `--bg-inset` | #EFEDE7 | #0B0D0C | Wells, inputs, avatars, code |
| `border-subtle` | `--border-subtle` | #E7E4DC | #242826 | Default structural hairline |
| `border` | `--border` | #D9D5CA | #2F3431 | Controls, emphasized dividers |
| `text-primary` | `--text-primary` | #16181B | #ECEDE9 | Body, headings, figures |
| `text-secondary` | `--text-secondary` | #565B62 | #A6ABA6 | Supporting text |
| `text-muted` | `--text-muted` | #686C72 | #858B85 | Captions, eyebrows, placeholders |
| `text-inverse` | `--text-inverse` | #FFFFFF | #0F1110 | Text on brand fills |
| `brand-50…700` | `--brand-*` | 50 #E8F1ED · 300 #79B59D · 400 #1F7A5C · 500 #0B5D45 · 600 #084A37 · 700 #063829 | 50 #13261F · 300 #9ADBC0 · 400 #6FCBA6 · 500 #4CB88F · 600 #3A9D78 · 700 #2A7A5C | Primary actions, selection, focus |
| `info-500` | `--info` | #2B5C9E | #7AA7E0 | Informational, rare |
| `positive` / `positive-soft` | `--positive(-soft)` | #17784F / #E7F2EC | #4CB88F / #142A21 | Settled, received, success |
| `negative` / `negative-soft` | `--negative(-soft)` | #B42318 / #FBEAE8 | #F0716A / #2E1716 | Failed, outflow warnings, destructive |
| `warning` / `warning-soft` | `--warning(-soft)` | #A15C07 / #FBF0DF | #E0A54B / #2C2214 | Pending, needs attention |

Contrast of `text-muted` (WCAG, small text needs 4.5:1): light #686C72 is 4.84 on base, 5.28 on surface,
4.55 on sidebar, 4.51 on inset; dark #858B85 is 5.44 on base, 5.13 on surface, 4.82 on elevated.
(Adjusted from the plan's #6B6F75, which measured 4.36 on the light sidebar.)

Brand green is reserved for primary actions and positive state. Everything else is neutral.

## Typography

| Role | Class | Notes |
|---|---|---|
| Display | `font-display` (Newsreader 400/500, italic 400) | Landing headlines, app page titles, hero numbers |
| UI | `font-sans` (Geist 400–600) | Everything else |
| Figures | `font-mono tabular-nums` or `.num` (Geist Mono 400–500) | Amounts, addresses, hashes, IDs. Always tabular |

Scale (app): page title 28–32px display / section title 15–16px sans 600 / body 14px / small 13px /
caption 12px / eyebrow 11px uppercase, `tracking-[0.08em]`, muted (`.eyebrow`).
Scale (landing): hero 56–72px display, tracking -0.02em / h2 36–44px display / lead 18px / body 16px.

## Shape, elevation, motion

- Radius: 6px controls (`rounded-[6px]` / `rounded-control`), 10px cards (`rounded-card`), 14px maximum.
- Structure comes from 1px `border-border-subtle` lines. Shadows: `shadow-card` (0 1px 2px / 4%) on
  cards and buttons, `shadow-pop` for menus, popovers, dialogs. No other shadows.
- Motion: 120–200ms ease-out, opacity and translate ≤ 6px. `prefers-reduced-motion` disables
  animation globally. Content must render without JS animation.
- Focus: `.focus-ring` gives a 2px brand ring with 2px offset on keyboard focus. Every interactive
  element needs it. Hit targets ≥ 36px (`Button size="sm"` extends its hit area invisibly).

## Primitives (`src/components/UI.tsx`)

- `Button` variants: `primary` (brand fill, one per view region), `secondary` (bordered surface),
  `ghost` (text-only, toolbars), `danger` (bordered, red text; fills only on hover). Sizes `sm` 32px,
  `md` 36px, `lg` 44px (landing CTAs).
- `Card`: surface, subtle border, 10px radius, `shadow-card`. Pad 20–24px.
- `Pill` tones: `neutral`, `positive`, `negative`, `warning`, `brand`; legacy `green`→positive,
  `amber`→warning, `blue`→info, `purple`→neutral outline.
- `Avatar`: neutral initials on `bg-inset` with a hairline ring. The `color` prop is ignored.
- `LiveDot`: 6px positive dot with a slow, faint halo (static under reduced motion).
- `Logo` / `LogoMark`: ruled-circle mark in `currentColor` (brand) + Newsreader wordmark.

## Do / don't

Do
- Use sentence case, plain and specific copy. No exclamation marks.
- Right-align numeric columns and set them in `.num`.
- Let whitespace and hairlines do the work; one primary button per area.
- Check both themes and AA contrast for every new screen.

Don't
- Neon glows, gradient blobs, grid backgrounds, glassmorphism, emoji, sparkles.
- Rainbow avatars or colored icons for decoration.
- Pills for everything; use them for status only.
- Large drop shadows, radii above 14px, hardcoded hex values in components (use tokens).
- `whileInView` reveals that leave sections blank without JS.
