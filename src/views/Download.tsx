import { useState } from 'react'
import { Footer } from './landing/Closing'
import { detectClient, useInstallPrompt } from './download/useInstallPrompt'
import { DownloadHeader } from './download/parts'
import { DownloadHero } from './download/Hero'
import { InstallSection } from './download/Install'
import { SourceSection } from './download/Source'
import { DeploySection, NotesSection, RunSection } from './download/Build'

export function Download() {
  const install = useInstallPrompt()
  const [client] = useState(detectClient)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <a
        href="#main"
        className="sr-only z-50 rounded-[6px] bg-bg-surface px-3 py-2 text-[14px] text-text-primary shadow-pop focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-ring"
      >
        Skip to content
      </a>
      <DownloadHeader />
      <main id="main">
        <DownloadHero install={install} client={client} />
        <div className="space-y-28 pb-28 sm:space-y-36 sm:pb-36">
          <InstallSection install={install} client={client} />
          <SourceSection />
          <RunSection />
          <DeploySection />
          <NotesSection />
        </div>
      </main>
      <div className="border-t border-border-subtle">
        <Footer />
      </div>
    </div>
  )
}
