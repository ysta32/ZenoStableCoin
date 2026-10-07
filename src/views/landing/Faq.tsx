import { ReactNode } from 'react'
import { IconChevronDown } from '../../components/Icons'
import { ASSUMED_APY } from '../../lib/fees'
import { REPO_URL, Section, TextLink } from './shared'

const QA: { q: string; a: ReactNode }[] = [
  {
    q: 'Is this live?',
    a: (
      <>
        No. Zeno is a working prototype. The demo runs entirely in your browser on mock data, stores changes in local
        storage, and never connects to a wallet, bank or blockchain. No real funds move.
      </>
    ),
  },
  {
    q: 'Which stablecoins are supported?',
    a: (
      <>
        The demo models USDC and USDT payouts, plus EUR bank transfers for people who prefer local currency. The design
        assumes a low-fee network for settlement; the specific chain is not fixed yet.
      </>
    ),
  },
  {
    q: 'Where does the yield come from?',
    a: (
      <>
        The model assumes idle balance is held in tokenized U.S. Treasury bill funds at about{' '}
        {(ASSUMED_APY * 100).toFixed(1)}% a year. Real yields move with short-term rates, and tokenized funds carry
        issuer, custody and smart-contract risk, so returns are not guaranteed. In the demo, yield is simulated.
      </>
    ),
  },
  {
    q: 'What about compliance?',
    a: (
      <>
        The prototype does not perform KYC, sanctions screening or tax reporting. A production version would need
        licensed partners for on- and off-ramps, payee verification and the right forms per country. We would rather
        say that plainly than imply otherwise.
      </>
    ),
  },
  {
    q: 'Can I self-host it, and under what license?',
    a: (
      <>
        The source is public on <TextLink href={REPO_URL}>GitHub</TextLink> and runs with a standard Vite setup. A
        license file has not been added yet, so default copyright applies; open an issue if you want to reuse the code.
      </>
    ),
  },
  {
    q: 'How is FX handled for EUR bank payouts?',
    a: (
      <>
        Amounts are entered in USD. For EUR bank recipients, the intended flow converts USDC to EUR through an off-ramp
        partner and pays out over SEPA, with the rate shown at review. The demo labels these payouts but does not apply a
        live exchange rate.
      </>
    ),
  },
]

export function Faq() {
  return (
    <Section id="faq" n="06" label="FAQ" title="Straight answers." lead="If something here is unclear, open an issue on GitHub.">
      <div className="border-t border-border-subtle">
        {QA.map(({ q, a }) => (
          <details key={q} className="group border-b border-border-subtle">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-6 rounded-[4px] py-4 text-[17px] text-text-primary focus-ring [&::-webkit-details-marker]:hidden">
              {q}
              <IconChevronDown
                width={16}
                height={16}
                aria-hidden="true"
                className="shrink-0 text-text-muted transition-transform duration-150 ease-out group-open:rotate-180"
              />
            </summary>
            <div className="max-w-[640px] pb-6 pr-8 text-[15.5px] leading-[1.65] text-text-secondary">{a}</div>
          </details>
        ))}
      </div>
    </Section>
  )
}
