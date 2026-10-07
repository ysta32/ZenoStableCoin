// Renders the social cover (public/og-cover.png) and README banner (docs/banner.png)
// from an inline HTML template in the Ledger look. Run: npm run og
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
// Fonts are inlined as data: URLs because setContent() runs at about:blank,
// where Chromium blocks file:// resources.
const font = (pkg, file) =>
  'data:font/woff2;base64,' +
  readFileSync(path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).toString('base64')

const html = (w, h) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face{font-family:'Newsreader Variable';src:url('${font('newsreader', 'newsreader-latin-wght-normal.woff2')}') format('woff2');font-weight:200 800;font-style:normal}
@font-face{font-family:'Newsreader Variable';src:url('${font('newsreader', 'newsreader-latin-wght-italic.woff2')}') format('woff2');font-weight:200 800;font-style:italic}
@font-face{font-family:'Geist Variable';src:url('${font('geist', 'geist-latin-wght-normal.woff2')}') format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;background:#f6f3ec;color:#16181b;font-family:'Geist Variable',sans-serif;position:relative;overflow:hidden}
.frame{position:absolute;inset:${Math.round(h * 0.075)}px ${Math.round(w * 0.06)}px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:12px;color:#0b5d45}
.brand span{font-family:'Newsreader Variable',serif;font-weight:500;font-size:34px;color:#16181b;letter-spacing:-0.01em}
h1{font-family:'Newsreader Variable',serif;font-weight:400;font-size:${Math.round(w * 0.063)}px;line-height:1.06;letter-spacing:-0.02em;max-width:${Math.round(w * 0.78)}px}
h1 em{font-style:italic;color:#0b5d45}
.foot{border-top:1px solid #d9d5ca;padding-top:20px;display:flex;justify-content:space-between;font-size:22px;color:#565b62;letter-spacing:0.01em}
</style></head><body><div class="frame">
<div class="brand"><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M3 12A9 9 0 0 0 21 12Z" fill="currentColor"/></svg><span>Zeno</span></div>
<h1>Payroll in stablecoins, <em>without the wire fees.</em></h1>
<div class="foot"><span>Prototype &middot; USDC / USDT</span><span>zeno-stable-coin.vercel.app</span></div>
</div></body></html>`

const targets = [
  { file: 'public/og-cover.png', w: 1200, h: 630 },
  { file: 'docs/banner.png', w: 1280, h: 640 },
]

const browser = await chromium.launch()
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: t.w, height: t.h } })
  await page.setContent(html(t.w, t.h))
  await page.evaluate(() => document.fonts.ready)
  const ok = await page.evaluate(
    () => document.fonts.check('48px "Newsreader Variable"') && document.fonts.check('16px "Geist Variable"'),
  )
  if (!ok) throw new Error('og: fonts failed to load')
  await page.screenshot({ path: path.join(root, t.file) })
  await page.close()
  console.log('wrote', t.file)
}
await browser.close()
