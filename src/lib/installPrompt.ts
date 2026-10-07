/**
 * App-scope store for the browser's install prompt. `beforeinstallprompt` can
 * fire once, early, on any route, so it is captured here at startup (see
 * main.tsx) and read by whichever view needs it.
 */

/** Chromium-only event; not in lib.dom yet. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type InstallSnapshot = {
  /** A captured prompt is available to show. */
  canInstall: boolean
  /** Running as an installed app, or installed during this session. */
  installed: boolean
}

let deferred: BeforeInstallPromptEvent | null = null
let installed = false
let snapshot: InstallSnapshot = { canInstall: false, installed: false }
let started = false
const listeners = new Set<() => void>()

function emit() {
  snapshot = { canInstall: deferred !== null && !installed, installed }
  listeners.forEach((l) => l())
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
  )
}

/** Attach the global listeners. Idempotent; call once before rendering. */
export function initInstallPrompt(): void {
  if (started || typeof window === 'undefined') return
  started = true
  installed = isStandalone()
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    emit()
  })
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', (e) => {
    if (e.matches) {
      installed = true
      emit()
    }
  })
  emit()
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getInstallSnapshot(): InstallSnapshot {
  return snapshot
}

/** Show the captured prompt. A prompt can only be used once, so it is cleared either way. */
export async function promptInstall(): Promise<void> {
  const e = deferred
  if (!e) return
  deferred = null
  emit()
  try {
    await e.prompt()
    const { outcome } = await e.userChoice
    if (outcome === 'accepted') {
      installed = true
      emit()
    }
  } catch {
    // prompt() rejects if the event was already used; the page falls back to manual steps.
  }
}
