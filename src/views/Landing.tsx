import { Nav } from './landing/Nav'
import { Hero } from './landing/Hero'
import { HowItWorks } from './landing/HowItWorks'
import { Calculator } from './landing/Calculator'
import { Features } from './landing/Features'
import { Developers } from './landing/Developers'
import { Comparison } from './landing/Comparison'
import { Trust } from './landing/Trust'
import { Faq } from './landing/Faq'
import { FinalCta, Footer } from './landing/Closing'

export function Landing() {
  return (
    <div id="top" className="min-h-screen bg-bg-base text-text-primary">
      <a
        href="#main"
        className="sr-only z-50 rounded-[6px] bg-bg-surface px-3 py-2 text-[14px] text-text-primary shadow-pop focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-ring"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <div className="space-y-28 sm:space-y-36">
          <HowItWorks />
          <Calculator />
          <Features />
          <Developers />
          <Comparison />
          <Trust />
          <Faq />
        </div>
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
