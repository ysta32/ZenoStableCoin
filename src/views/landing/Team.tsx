import { Avatar } from '../../components/UI'
import { Section } from './shared'

const FOUNDERS = [
  { name: 'Arpan Ghoshal', role: 'Chief Executive Officer', initials: 'AG' },
  { name: 'Darya Saadat', role: 'Chief Marketing Officer', initials: 'DS' },
  { name: 'Stanley Yang', role: 'Chief Technology Officer', initials: 'SY' },
  { name: 'Jacob Wang', role: 'Chief Financial Officer', initials: 'JW' },
]

export function Team() {
  return (
    <Section
      n="06"
      label="Team"
      title="Who is building it."
      lead="Zeno is an early project from a four-person founding team. Questions and pull requests are welcome on GitHub."
    >
      <ul className="grid grid-cols-2 border-t border-border-subtle sm:grid-cols-4">
        {FOUNDERS.map((f, i) => (
          <li
            key={f.name}
            className={`border-b border-border-subtle py-6 pr-4 ${i % 2 === 1 ? 'border-l pl-4 sm:pl-5' : ''} ${
              i > 0 ? 'sm:border-l sm:pl-5' : ''
            }`}
          >
            <Avatar initials={f.initials} color="" size={44} />
            <div className="mt-4 text-[15px] font-medium text-text-primary">{f.name}</div>
            <div className="mt-0.5 text-[13.5px] text-text-secondary">{f.role}</div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
