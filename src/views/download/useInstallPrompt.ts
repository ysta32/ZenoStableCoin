import { useCallback, useEffect, useState } from 'react'

/** Chromium-only event; not in lib.dom yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
  )
}

export type InstallState = {
  /** The browser offered an install prompt we can trigger. */
  canInstall: boolean
  /** Running as an installed app, or the user just installed it. */
  installed: boolean
  install: () => Promise<void>
}

/**
 * Local install-prompt hook for the download page. Captures
 * `beforeinstallprompt`, exposes `install()`, and reports installed state from
 * `appinstalled` or standalone display mode.
 */
export function useInstallPrompt(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setInstalled(true)
    }
    const mq = window.matchMedia?.('(display-mode: standalone)')
    const onMode = (e: MediaQueryListEvent) => {
      if (e.matches) setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    mq?.addEventListener?.('change', onMode)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      mq?.removeEventListener?.('change', onMode)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return
    // A captured prompt can only be shown once; drop it either way.
    setDeferred(null)
    try {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setInstalled(true)
    } catch {
      // prompt() rejects if the event was already used; the page falls back to manual steps.
    }
  }, [deferred])

  return { canInstall: deferred !== null && !installed, installed, install }
}

export type PlatformId = 'macos' | 'windows' | 'ios' | 'android'

export type ClientInfo = {
  platform: PlatformId | null
  browser: 'safari' | 'chrome' | 'edge' | 'firefox' | 'other'
}

/** Best-effort, userAgent based; only used to order and highlight the install cards. */
export function detectClient(): ClientInfo {
  if (typeof navigator === 'undefined') return { platform: null, browser: 'other' }
  const ua = navigator.userAgent
  const touchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1 // iPadOS reports as macOS
  let platform: PlatformId | null = null
  if (/iPhone|iPad|iPod/.test(ua) || touchMac) platform = 'ios'
  else if (/Android/.test(ua)) platform = 'android'
  else if (/Windows/.test(ua)) platform = 'windows'
  else if (/Macintosh|Mac OS X/.test(ua)) platform = 'macos'

  let browser: ClientInfo['browser'] = 'other'
  if (/Edg(A|iOS)?\//.test(ua)) browser = 'edge'
  else if (/Firefox|FxiOS/.test(ua)) browser = 'firefox'
  else if (/Chrome|CriOS|Chromium/.test(ua)) browser = 'chrome'
  else if (/Safari/.test(ua)) browser = 'safari'
  return { platform, browser }
}
