/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        const activate = (w: ServiceWorker | null) => {
          // Only prompt-less update when an existing controller is being replaced.
          if (w && navigator.serviceWorker.controller) w.postMessage('SKIP_WAITING')
        }
        activate(reg.waiting)
        reg.addEventListener('updatefound', () => {
          const w = reg.installing
          w?.addEventListener('statechange', () => {
            if (w.state === 'installed') activate(w)
          })
        })
      })
      .catch(() => {
        // Offline support is an enhancement; the app works without it.
      })
    // Reload once when an updated worker takes over (not on first install).
    let reloaded = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded || !hadController) return
      reloaded = true
      window.location.reload()
    })
  })
}
