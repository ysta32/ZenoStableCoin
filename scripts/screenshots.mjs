import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const result = spawnSync(process.execPath, [require.resolve('@playwright/test/cli'), 'test'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, ZENO_SCREENSHOTS: '1' },
  stdio: 'inherit',
})
if (result.error) throw result.error
process.exitCode = result.status ?? 1
