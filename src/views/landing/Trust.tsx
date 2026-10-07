import { REPO_URL, Section } from './shared'

const CARDS = [
  { title: 'MIT licensed, source on GitHub', href: REPO_URL },
  { title: 'Every change runs 100+ tests in CI', href: `${REPO_URL}/actions` },
  { title: 'Release notes for every version', href: `${REPO_URL}/releases` },
  { title: 'Responsible disclosure', href: `${REPO_URL}/security/policy` },
]

export function Trust() {
  return (
    <Section id="trust" n="05a" label="Trust" title="Built in the open">
      <ul className="grid gap-4 sm:grid-cols-2">
        {CARDS.map(({ title, href }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-[6px] border border-border bg-bg-surface p-6 text-[17px] text-text-primary shadow-card transition-colors hover:bg-bg-elevated focus-ring"
            >
              <h3 className="font-medium">{title}</h3>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
