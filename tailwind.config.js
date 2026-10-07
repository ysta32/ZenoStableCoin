/** @type {import('tailwindcss').Config} */
// "Ledger" design system. Colors resolve to CSS variables defined in
// src/styles.css (:root = light, :root.dark = dark) so opacity modifiers
// such as `bg-brand-500/10` keep working.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: v('bg-base'),
          surface: v('bg-surface'),
          elevated: v('bg-elevated'),
          sidebar: v('bg-sidebar'),
          inset: v('bg-inset'),
        },
        border: {
          subtle: v('border-subtle'),
          DEFAULT: v('border'),
        },
        text: {
          primary: v('text-primary'),
          secondary: v('text-secondary'),
          muted: v('text-muted'),
          inverse: v('text-inverse'),
        },
        brand: {
          50: v('brand-50'),
          300: v('brand-300'),
          400: v('brand-400'),
          500: v('brand-500'),
          600: v('brand-600'),
          700: v('brand-700'),
        },
        info: {
          500: v('info'),
        },
        positive: { DEFAULT: v('positive'), soft: v('positive-soft') },
        negative: { DEFAULT: v('negative'), soft: v('negative-soft') },
        warning: { DEFAULT: v('warning'), soft: v('warning-soft') },
      },
      fontFamily: {
        display: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        control: '6px',
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04)',
        pop: '0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -6px rgb(0 0 0 / 0.14)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
