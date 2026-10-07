import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

// Injects the build's emitted asset list and a per-build version into dist/sw.js,
// so the service worker precaches index.html together with its hashed JS/CSS/fonts.
function swPrecache(): Plugin {
  let outDir = 'dist'
  let root = process.cwd()
  return {
    name: 'zeno-sw-precache',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = config.build.outDir
      root = config.root
    },
    closeBundle() {
      const dist = path.resolve(root, outDir)
      const swPath = path.join(dist, 'sw.js')
      const assetsDir = path.join(dist, 'assets')
      if (!existsSync(swPath) || !existsSync(assetsDir)) return
      const assets = readdirSync(assetsDir)
        .filter((f) => /\.(js|css|woff2?|ttf|otf|svg|png|webp)$/.test(f))
        // Fonts: precache only the latin subsets; other subsets load lazily via unicode-range.
        .filter((f) => !/\.woff2?$/.test(f) || (f.includes('-latin-') && !f.includes('-latin-ext-')))
        .sort()
        .map((f) => `/assets/${f}`)
      const html = readFileSync(path.join(dist, 'index.html'))
      const build = createHash('sha256').update(html).update(assets.join('|')).digest('hex').slice(0, 10)
      const src = readFileSync(swPath, 'utf8')
      if (!src.includes('/*__PRECACHE__*/') || !src.includes('__BUILD__')) {
        throw new Error('zeno-sw-precache: placeholders missing in sw.js')
      }
      writeFileSync(
        swPath,
        src
          .replace('[] /*__PRECACHE__*/', JSON.stringify(assets) + ' /*__PRECACHE__*/')
          .replace('__BUILD__', build)
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), swPrecache()],
})
