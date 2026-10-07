import { useSyncExternalStore } from 'react'
import { getInstallSnapshot, promptInstall, subscribeInstall } from '../../lib/installPrompt'

export type InstallState = {
  /** The browser offered an install prompt we can trigger. */
  canInstall: boolean
  /** Running as an installed app, or the user just installed it. */
  installed: boolean
  install: () => Promise<void>
}

/** Reads the app-scope install prompt store (captured in main.tsx before any route loads). */
export function useInstallPrompt(): InstallState {
  const snap = useSyncExternalStore(subscribeInstall, getInstallSnapshot, getInstallSnapshot)
  return { canInstall: snap.canInstall, installed: snap.installed, install: promptInstall }
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
