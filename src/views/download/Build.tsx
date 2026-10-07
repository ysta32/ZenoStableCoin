import { RELEASES, RELEASES_URL, formatReleaseDate, releaseUrl } from '../../data/releases'
import { REPO_URL, Section } from '../landing/shared'
import { CopyButton, OutLink } from './parts'

const COMMANDS = [`git clone ${REPO_URL}.git`, 'cd ZenoStableCoin', 'npm ci', 'npm run dev']

const REQUIREMENTS: [string, string][] = [
  ['Node.js', '20 or later'],
  ['npm', '10 or later'],
  ['Browser', 'Current Chrome, Edge, Safari or Firefox'],
]

const SCRIPTS: [string, string][] = [
  ['npm run build', 'Type-check and build static files into dist/'],
  ['npm run preview', 'Serve the production build locally'],
  ['npm test', 'Run the unit tests once'],
  ['npm run check', 'Types, lint and tests, as CI runs them'],
]

export function RunSection() {
  return (
    <Section
      id="run"
      n="03"
      label="Run it locally"
      title="Four commands to a dev server."
      lead={
        <>
          Clone the repository, install exact dependencies from the lockfile, and start Vite with
          hot reload.
        </>
      }
    >
      <div className="overflow-hidden rounded-[10px] border border-border-subtle bg-bg-inset">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface pl-4 pr-2">
          <span className="num text-[11.5px] text-text-muted">~/code</span>
          <CopyButton text={COMMANDS.join('\n')} label="Copy all four commands" />
        </div>
        <pre className="num overflow-x-auto px-4 py-5 text-[12.5px] leading-[1.8] sm:px-5 sm:text-[13px]">
          <code>
            {COMMANDS.map((c) => (
              <span key={c} className="grid grid-cols-[16px_1fr]">
                <span aria-hidden="true" className="select-none text-text-muted">
                  $
                </span>
                <span className="whitespace-pre-wrap break-all text-text-primary">{c}</span>
              </span>
            ))}
            <span
              className="mt-4 block select-none whitespace-pre text-text-muted"
              aria-hidden="true"
            >
              {'  VITE ready\n  ➜  Local:   '}
              <span className="text-brand-500">http://localhost:5173/</span>
            </span>
          </code>
        </pre>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-[15px] font-medium text-text-primary">Requirements</h3>
          <dl className="mt-3 border-t border-border">
            {REQUIREMENTS.map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-border-subtle py-3"
              >
                <dt className="text-[13.5px] text-text-secondary">{k}</dt>
                <dd className="text-right text-[13.5px] text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="text-[15px] font-medium text-text-primary">Other scripts</h3>
          <dl className="mt-3 border-t border-border">
            {SCRIPTS.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 border-b border-border-subtle py-3">
                <dt className="num text-[13px] text-text-primary">{k}</dt>
                <dd className="text-[13px] text-text-secondary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}

const VERCEL_CLONE =
  'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fysta32%2FZenoStableCoin&project-name=zeno'

const VERCEL_SETTINGS: [string, string][] = [
  ['Framework preset', 'Vite'],
  ['Rewrite', 'vercel.json'],
]

const HOST_SETTINGS: [string, string][] = [
  ['Build command', 'npm run build'],
  ['Output directory', 'dist'],
  ['Rewrite', '/*  →  /index.html'],
]

export function DeploySection() {
  return (
    <Section
      id="deploy"
      n="04"
      label="Deploy your own"
      title="Your own copy, on your own domain."
      lead={
        <>
          Zeno builds to a folder of static files. Any host that serves files and falls back to
          index.html works.
        </>
      }
    >
      <div className="grid gap-px overflow-hidden rounded-[10px] border border-border-subtle bg-border-subtle md:grid-cols-2">
        <div className="flex flex-col bg-bg-surface p-6 sm:p-7">
          <h3 className="font-display text-[24px] leading-[1.15] tracking-[-0.01em] text-text-primary">
            Vercel
          </h3>
          <p className="mt-2 text-[14.5px] leading-[1.6] text-text-secondary">
            Copies the repository to your GitHub account and deploys it. Later pushes to main
            redeploy on their own.
          </p>
          <dl className="mt-4 border-t border-border-subtle">
            {VERCEL_SETTINGS.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border-subtle py-3"
              >
                <dt className="text-[13.5px] text-text-secondary">{k}</dt>
                <dd className="num text-[13px] text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 md:mt-auto md:pt-6">
            <a
              href={VERCEL_CLONE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2.5 whitespace-nowrap rounded-[6px] bg-text-primary px-5 text-[15px] font-medium text-bg-base shadow-card transition-opacity hover:opacity-90 focus-ring"
            >
              <svg
                viewBox="0 0 16 16"
                width={13}
                height={13}
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 1.5l7 12.5H1z" />
              </svg>
              Deploy to Vercel
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="bg-bg-base p-6 sm:p-7">
          <h3 className="font-display text-[24px] leading-[1.15] tracking-[-0.01em] text-text-primary">
            Netlify or any static host
          </h3>
          <dl className="mt-4 border-t border-border-subtle">
            {HOST_SETTINGS.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border-subtle py-3"
              >
                <dt className="text-[13.5px] text-text-secondary">{k}</dt>
                <dd className="num whitespace-pre text-[13px] text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] leading-[1.6] text-text-muted">
            On Netlify, add <code className="num text-text-secondary">/* /index.html 200</code> to{' '}
            <code className="num text-text-secondary">public/_redirects</code> so deep links like
            /app/payroll load.
          </p>
        </div>
      </div>
    </Section>
  )
}

export function NotesSection() {
  const recent = RELEASES.slice(0, 3)
  return (
    <Section
      id="notes"
      n="05"
      label="Release notes"
      title="What changed, and when."
      lead={
        <>
          The last three releases. Older notes and every tag live on{' '}
          <OutLink href={RELEASES_URL}>GitHub</OutLink>.
        </>
      }
    >
      <ol className="border-t border-border">
        {recent.map((r) => (
          <li
            key={r.tag}
            className="grid gap-x-8 gap-y-3 border-b border-border-subtle py-7 sm:grid-cols-[160px_1fr]"
          >
            <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
              <span className="num text-[15px] text-text-primary">{r.tag}</span>
              <time dateTime={r.date} className="text-[13px] text-text-muted">
                {formatReleaseDate(r.date)}
              </time>
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-[22px] leading-[1.2] tracking-[-0.01em] text-text-primary">
                {r.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {r.notes.map((n) => (
                  <li
                    key={n}
                    className="grid grid-cols-[18px_1fr] text-[14.5px] leading-[1.6] text-text-secondary"
                  >
                    <span aria-hidden="true" className="mt-[11px] h-px w-2.5 bg-text-muted" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
              <OutLink href={releaseUrl(r.tag)} className="mt-4 text-[13px]">
                {r.tag} on GitHub
              </OutLink>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <OutLink href={RELEASES_URL} className="text-[14px]">
          Full changelog
        </OutLink>
      </div>
    </Section>
  )
}
