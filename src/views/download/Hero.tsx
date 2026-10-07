import { Button } from '../../components/UI'
import { useApp } from '../../context/AppContext'
import { preloadView } from '../../preload'
import { LATEST, archiveUrl, formatReleaseDate } from '../../data/releases'
import { Container } from '../landing/shared'
import { ClientInfo, InstallState } from './useInstallPrompt'
import { PLATFORMS } from './platforms'
import { ArrowDown, Check, outlineButton } from './parts'

const BROWSER_NAMES: Record<ClientInfo['browser'], string> = {
  safari: 'Safari',
  chrome: 'Chrome',
  edge: 'Edge',
  firefox: 'Firefox',
  other: 'Browser',
}

export function DownloadHero({ install, client }: { install: InstallState; client: ClientInfo }) {
  const { navigate } = useApp()
  const prefetch = () => {
    void preloadView.dashboard()
  }
  const platform = PLATFORMS.find((p) => p.id === client.platform)
  const method = platform?.methodFor(client.browser)

  const facts: [string, string, string][] = [
    [
      'This device',
      platform ? `${platform.name} · ${BROWSER_NAMES[client.browser]}` : 'Not detected',
      install.installed ? 'Zeno is installed here' : 'Install steps are below',
    ],
    ['Latest', LATEST.tag, `Released ${formatReleaseDate(LATEST.date)}`],
    ['Runs in', 'Any modern browser', 'No account, no server'],
    ['Your data', 'Stays local', 'Saved in this browser only'],
  ]

  return (
    <section aria-labelledby="download-title" className="pb-24 pt-14 sm:pt-20 lg:pb-32">
      <Container>
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-text-secondary">
              <span className="inline-flex h-6 items-center whitespace-nowrap rounded-[5px] border border-border px-2 text-[12px] font-medium text-text-primary">
                Open-source prototype
              </span>
              <span>
                <span className="num text-text-primary">{LATEST.tag}</span> ·{' '}
                {formatReleaseDate(LATEST.date)}
              </span>
            </p>
            <h1
              id="download-title"
              className="mt-7 font-display text-[56px] font-normal leading-[1] tracking-[-0.03em] text-text-primary sm:text-[80px] lg:text-[96px]"
            >
              Get <em className="italic">Zeno.</em>
            </h1>
            <p className="mt-6 max-w-[560px] text-[18px] leading-[1.6] text-text-secondary">
              Zeno runs in your browser. Install it as an app, or take the source and run it
              yourself.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {install.installed ? (
                <>
                  <span className="inline-flex h-11 items-center gap-2 rounded-[6px] border border-positive/30 bg-positive-soft px-4 text-[15px] font-medium text-positive">
                    <Check />
                    Installed on this device
                  </span>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('app')}
                    onMouseEnter={prefetch}
                    onFocus={prefetch}
                  >
                    Open the app
                  </Button>
                </>
              ) : install.canInstall ? (
                <Button variant="primary" size="lg" onClick={() => void install.install()}>
                  Install Zeno
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('app')}
                  onMouseEnter={prefetch}
                  onFocus={prefetch}
                >
                  Open in browser
                </Button>
              )}
              <a href={archiveUrl(LATEST.tag, 'zip')} className={`${outlineButton} px-5`}>
                <ArrowDown />
                Download source
              </a>
            </div>
            <p className="mt-4 text-[13px] text-text-muted">
              {install.canInstall
                ? 'Your browser can install Zeno directly. It opens in its own window and works like any other app.'
                : method && !install.installed
                  ? `To install on ${platform?.name}: ${method.short}.`
                  : `Source is a .zip of ${LATEST.tag} from GitHub. A .tar.gz is listed below.`}
            </p>
          </div>
          <div className="lg:col-span-4 lg:pt-[52px]">
            <dl className="grid grid-cols-2 border-t border-border lg:grid-cols-1">
              {facts.map(([k, v, note], i) => (
                <div
                  key={k}
                  className={`flex min-w-0 flex-col gap-0.5 border-b border-border-subtle py-3.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-4 ${
                    i % 2 === 0 ? 'pr-4 lg:pr-0' : 'border-l pl-4 lg:border-l-0 lg:pl-0'
                  }`}
                >
                  <dt className="text-[13px] text-text-secondary">{k}</dt>
                  <dd className="min-w-0 lg:text-right">
                    <span
                      className={`block text-[16px] text-text-primary ${k === 'Latest' ? 'num' : ''}`}
                    >
                      {v}
                    </span>
                    <span className="block text-[12px] text-text-muted">{note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  )
}
