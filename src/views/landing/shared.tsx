import { ReactNode, SVGProps } from 'react'

export const REPO_URL = 'https://github.com/ysta32/ZenoStableCoin'

/** Max-width content column used by every landing section. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>
}

/**
 * Editorial section: hairline rule, mono section number, title in the left
 * columns and content to the right on wide screens.
 */
export function Section({
  id,
  n,
  label,
  title,
  lead,
  children,
  stacked = false,
}: {
  id?: string
  n: string
  label: string
  title: ReactNode
  lead?: ReactNode
  children: ReactNode
  /** Put content beneath the heading instead of beside it. */
  stacked?: boolean
}) {
  const headingId = `${id ?? label.toLowerCase().replace(/\W+/g, '-')}-title`
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20">
      <Container>
        <div className="border-t border-border pt-6 sm:pt-8">
          <div className="flex items-baseline gap-3 text-[13px] text-text-muted">
            <span className="num">{n}</span>
            <span aria-hidden="true" className="h-px w-6 translate-y-[-3px] bg-border" />
            <span>{label}</span>
          </div>
        </div>
        <div
          className={`mt-6 grid grid-cols-1 gap-x-10 gap-y-10 ${stacked ? '' : 'lg:grid-cols-12'}`}
        >
          <div className={`min-w-0 ${stacked ? 'max-w-[720px]' : 'lg:col-span-4'}`}>
            <h2
              id={headingId}
              className="font-display text-[32px] font-normal leading-[1.08] tracking-[-0.02em] text-text-primary sm:text-[40px]"
            >
              {title}
            </h2>
            {lead && <p className="mt-4 text-[16.5px] leading-[1.6] text-text-secondary">{lead}</p>}
          </div>
          <div className={`min-w-0 ${stacked ? '' : 'lg:col-span-8'}`}>{children}</div>
        </div>
      </Container>
    </section>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  'aria-hidden': true,
}

export const GitHubIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" width={16} height={16} fill="currentColor" aria-hidden="true" {...p}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

export const LICurrencies = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="M14.6 10.1A5.5 5.5 0 1 1 10.1 14.6" />
    <path d="M9 6.5v5M7.4 7.7h2.4a1 1 0 0 1 0 2H8.2a1 1 0 0 0 0 2h2.4" />
  </svg>
)
export const LIYield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <path d="M3.5 20.5h17" />
    <path d="M4 16l5-5 3.5 3.5L20 7" />
    <path d="M15 7h5v5" />
  </svg>
)
export const LIExport = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <path d="M14 3.5H6.5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8z" />
    <path d="M14 3.5V8h4.5" />
    <path d="M8.5 12.5h7M8.5 15.5h7M8.5 18h4" />
  </svg>
)
export const LIKeyboard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
    <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 13.5h.01M18 13.5h.01M9 14.5h6" />
  </svg>
)
export const LIImport = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="1" />
    <path d="M3.5 9h17M3.5 14h17M9.5 9v11" />
  </svg>
)
export const LIApprove = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <path d="M12 3.5l7 2.5v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z" />
    <path d="M9 12l2.2 2.2L15.5 10" />
  </svg>
)
export const LICopy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} width={15} height={15} {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="1.5" />
    <path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5" />
  </svg>
)
export const LIMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)
export const LIClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
export const LISun = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} width={16} height={16} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
)
export const LIMoon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} width={16} height={16} {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
)

/** External link styled as a quiet underline. */
export function TextLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`rounded-[2px] text-text-primary underline decoration-border underline-offset-[3px] transition-colors hover:decoration-text-primary focus-ring ${className}`}
    >
      {children}
    </a>
  )
}
