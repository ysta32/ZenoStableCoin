import type { MouseEvent } from 'react'

/** Handles a left-click that should be an in-app navigation; modified clicks fall through to the browser. */
export function onPlainClick(go: () => void, after?: () => void) {
  return (e: MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return
    e.preventDefault()
    after?.()
    go()
  }
}
