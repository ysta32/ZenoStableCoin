// Rasterizes the Zeno mark into PWA icons (public/icons/*.png).
// Run: NODE_PATH=<dir containing playwright>/node_modules node scripts/icons.mjs
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  console.error(
    'playwright not found. Run with NODE_PATH=/path/to/node_modules node scripts/icons.mjs',
  )
  process.exit(1)
}

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/icons')
mkdirSync(out, { recursive: true })

const PAPER = '#F6F5F1'
const BRAND = '#0B5D45'

// Mark geometry (24-unit box, same as LogoMark): outer circle diameter = 2*(9 + sw/2).
// `frac` = mark diameter as a fraction of the canvas; `radius` = corner radius fraction.
function svg({ size, bg, fg, frac, radius = 0 }) {
  const sw = 1.6
  const outer = 2 * (9 + sw / 2)
  const s = (size * frac) / outer
  const t = size / 2 - 12 * s
  const r = size * radius
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
<g transform="translate(${t} ${t}) scale(${s})" color="${fg}"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="${sw}"/><path d="M3 12A9 9 0 0 0 21 12Z" fill="currentColor"/></g></svg>`
}

const icons = [
  // any: rounded paper tile, mark ~58% of canvas
  ['icon-192.png', { size: 192, bg: PAPER, fg: BRAND, frac: 0.58, radius: 0.22 }],
  ['icon-512.png', { size: 512, bg: PAPER, fg: BRAND, frac: 0.58, radius: 0.22 }],
  // maskable: full-bleed brand, mark diameter 56% (well inside the 80% safe circle)
  ['maskable-512.png', { size: 512, bg: BRAND, fg: PAPER, frac: 0.56 }],
  // apple: full-bleed (iOS applies its own mask)
  ['apple-touch-icon-180.png', { size: 180, bg: PAPER, fg: BRAND, frac: 0.6 }],
]

const browser = await chromium.launch()
for (const [name, opts] of icons) {
  const page = await browser.newPage({ viewport: { width: opts.size, height: opts.size } })
  await page.setContent(`<body style="margin:0;background:transparent">${svg(opts)}</body>`)
  const buf = await page.screenshot({
    omitBackground: true,
    clip: { x: 0, y: 0, width: opts.size, height: opts.size },
  })
  writeFileSync(path.join(out, name), buf)
  await page.close()
  console.log('wrote', name)
}
await browser.close()
