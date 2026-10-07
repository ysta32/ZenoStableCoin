import { Button } from '../../components/UI'
import { Section } from '../landing/shared'
import { ClientInfo, InstallState } from './useInstallPrompt'
import { PLATFORMS } from './platforms'
import { Check } from './parts'

export function InstallSection({ install, client }: { install: InstallState; client: ClientInfo }) {
  // Current platform first; the rest keep their reading order.
  const ordered = [...PLATFORMS].sort(
    (a, b) => Number(b.id === client.platform) - Number(a.id === client.platform),
  )

  return (
    <Section
      id="install"
      n="01"
      label="Install as an app"
      title="Install it like any other app."
      lead={
        <>
          Zeno is a web app your browser can install. It gets its own window and icon. There is no
          app store and no installer. Depending on the browser, the installed app may keep its own
          copy of the demo data; Safari keeps it separate from your tabs.
        </>
      }
    >
      <ul className="grid overflow-hidden rounded-[10px] border border-border-subtle gap-px bg-border-subtle sm:grid-cols-2">
        {ordered.map((p) => {
          const current = p.id === client.platform
          return (
            <li
              key={p.id}
              aria-current={current ? 'true' : undefined}
              className={`flex flex-col p-6 sm:p-7 ${current ? 'bg-bg-surface' : 'bg-bg-base'}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[26px] leading-[1.1] tracking-[-0.015em] text-text-primary">
                  {p.name}
                </h3>
                {current && (
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-brand-500">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    This device
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[13.5px] text-text-secondary">{p.result}</p>

              <div className="mt-5 space-y-5">
                {p.methods.map((m) => (
                  <div key={m.browsers}>
                    <p className="text-[12px] text-text-muted">{m.browsers}</p>
                    <ol className="mt-2.5 space-y-2.5">
                      {m.steps.map((s, i) => (
                        <li
                          key={i}
                          className="grid grid-cols-[22px_1fr] text-[14.5px] leading-[1.6] text-text-primary"
                        >
                          <span className="num pt-px text-[12px] leading-[1.95] text-text-muted">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {current && (install.canInstall || install.installed) && (
                <div className="mt-6 border-t border-border-subtle pt-5">
                  {install.installed ? (
                    <p className="inline-flex items-center gap-2 text-[14px] text-positive">
                      <Check />
                      Installed on this device
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Button variant="primary" onClick={() => void install.install()}>
                        Install Zeno
                      </Button>
                      <span className="text-[13px] text-text-muted">
                        Or skip the steps and install from here.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-5 max-w-[620px] text-[13.5px] leading-[1.6] text-text-muted">
        Firefox on desktop does not install web apps. Zeno works fully in a Firefox tab, or open
        this page in Chrome, Edge or Safari to install it.
      </p>
    </Section>
  )
}
