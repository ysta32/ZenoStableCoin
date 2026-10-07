import { LATEST, RELEASES, archiveUrl, releaseUrl } from '../../data/releases'
import { REPO_URL, Section } from '../landing/shared'
import { ArrowDown, OutLink, outlineButton } from './parts'

const primaryLink =
  'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-[6px] bg-brand-500 px-4 sm:px-5 text-[15px] font-medium text-text-inverse shadow-card transition-colors hover:bg-brand-600 active:bg-brand-700 focus-ring'

const smallLink =
  'rounded-[2px] text-text-secondary underline decoration-border underline-offset-[3px] transition-colors hover:text-text-primary hover:decoration-text-primary focus-ring'

export function SourceSection() {
  const previous = RELEASES.slice(1)
  return (
    <Section
      id="source"
      n="02"
      label="Download source"
      title="Take the whole thing."
      lead={
        <>
          Every release is a tagged snapshot of the repository. The archives come straight from
          GitHub and contain the full source, tests and docs.
        </>
      }
    >
      <article
        aria-labelledby="latest-title"
        className="rounded-[10px] border border-border-subtle bg-bg-surface shadow-card"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border-subtle px-6 py-4 sm:px-7">
          <p className="text-[13px] text-text-secondary">Latest release</p>
          <p className="num text-[13px] text-text-muted">
            <time dateTime={LATEST.date}>{LATEST.date}</time>
          </p>
        </div>
        <div className="px-6 py-6 sm:px-7 sm:py-7">
          <h3 id="latest-title" className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="num text-[28px] leading-none tracking-[-0.02em] text-text-primary">
              {LATEST.tag}
            </span>
            <span className="font-display text-[24px] leading-[1.15] tracking-[-0.01em] text-text-primary">
              {LATEST.title}
            </span>
          </h3>
          <p className="mt-3 max-w-[560px] text-[15px] leading-[1.6] text-text-secondary">
            {LATEST.summary}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-4">
            <div className="flex flex-wrap gap-3">
              <a href={archiveUrl(LATEST.tag, 'zip')} className={primaryLink}>
                <ArrowDown />
                <span className="sr-only sm:not-sr-only">Source</span>{' '}
                <span className="num text-[14px] sm:opacity-80">.zip</span>
              </a>
              <a
                href={archiveUrl(LATEST.tag, 'tar.gz')}
                className={`${outlineButton} px-4 sm:px-5`}
              >
                <ArrowDown />
                <span className="sr-only sm:not-sr-only">Source</span>{' '}
                <span className="num text-[14px] sm:text-text-muted">.tar.gz</span>
              </a>
            </div>
            <OutLink href={releaseUrl(LATEST.tag)} className="text-[14px]">
              Release page
            </OutLink>
          </div>
        </div>
      </article>

      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[15px] font-medium text-text-primary">Previous releases</h3>
          <OutLink href={`${REPO_URL}/tags`} className="text-[13px]">
            All tags
          </OutLink>
        </div>
        <table className="mt-4 w-full border-t border-border text-left">
          <caption className="sr-only">Previous releases with source downloads</caption>
          <thead>
            <tr className="border-b border-border-subtle text-[12px] text-text-muted">
              <th scope="col" className="py-2.5 pr-4 font-normal">
                Version
              </th>
              <th scope="col" className="hidden py-2.5 pr-4 font-normal sm:table-cell">
                Released
              </th>
              <th scope="col" className="hidden py-2.5 pr-4 font-normal md:table-cell">
                Summary
              </th>
              <th scope="col" className="py-2.5 text-right font-normal">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {previous.map((r) => (
              <tr key={r.tag} className="border-b border-border-subtle align-top">
                <th scope="row" className="py-4 pr-4 font-normal">
                  <a
                    href={releaseUrl(r.tag)}
                    target="_blank"
                    rel="noreferrer"
                    className="num rounded-[2px] text-[14px] text-text-primary underline decoration-border underline-offset-[3px] hover:decoration-text-primary focus-ring"
                  >
                    {r.tag}
                    <span className="sr-only"> release notes (opens in a new tab)</span>
                  </a>
                  <span className="mt-1 block text-[13px] text-text-secondary sm:hidden">
                    <time dateTime={r.date} className="num text-text-muted">
                      {r.date}
                    </time>
                  </span>
                  <span className="mt-1 block text-[13px] leading-[1.5] text-text-secondary md:hidden">
                    {r.title}
                  </span>
                </th>
                <td className="num hidden whitespace-nowrap py-4 pr-4 text-[13px] text-text-secondary sm:table-cell">
                  <time dateTime={r.date}>{r.date}</time>
                </td>
                <td className="hidden py-4 pr-6 text-[13.5px] leading-[1.55] text-text-secondary md:table-cell">
                  <span className="text-text-primary">{r.title}.</span> {r.summary}
                </td>
                <td className="whitespace-nowrap py-4 text-right text-[13px]">
                  <a href={archiveUrl(r.tag, 'zip')} className={`num ${smallLink}`}>
                    .zip<span className="sr-only"> of {r.tag}</span>
                  </a>
                  <span aria-hidden="true" className="mx-2 text-border">
                    /
                  </span>
                  <a href={archiveUrl(r.tag, 'tar.gz')} className={`num ${smallLink}`}>
                    .tar.gz<span className="sr-only"> of {r.tag}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
