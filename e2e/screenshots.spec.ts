import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const output = fileURLToPath(new URL('../docs/screenshots/', import.meta.url))
const time = new Date('2026-10-07T15:00:00Z')

test.beforeEach(async ({ page }) => {
  await mkdir(output, { recursive: true })
  await page.clock.install({ time })
  await page.clock.pauseAt(new Date(time.getTime() + 1000))
  await page.addInitScript(() => {
    localStorage.clear()
    Math.random = () => 0.5
    let byte = 0
    Object.defineProperty(crypto, 'getRandomValues', {
      value: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) array[i] = byte++ % 256
        return array
      },
    })
  })
})

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.clock.runFor(1000)
}

async function capture(page: Page, name: string) {
  await page.mouse.move(0, 0)
  await page.screenshot({ path: `${output}${name}.png`, animations: 'disabled' })
}

for (const mobile of [false, true]) {
  test(`capture landing${mobile ? ' mobile' : ''}`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await settle(page)
    await capture(page, mobile ? 'landing-mobile' : 'landing')
  })
}

for (const view of ['dashboard', 'dashboard-dark', 'treasury', 'team', 'transactions']) {
  test(`capture ${view}`, async ({ page }) => {
    const route = view.startsWith('dashboard') ? '' : `/${view}`
    await page.goto(`/app${route}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await settle(page)
    if (view === 'dashboard-dark') {
      await page.getByRole('radio', { name: 'Dark', exact: true }).click()
      await settle(page)
    }
    await capture(page, view)
  })
}

test('capture payroll review and completion', async ({ page }) => {
  await page.goto('/app/payroll')
  await expect(page.getByRole('heading', { name: 'Set payroll amounts' })).toBeVisible()
  await settle(page)
  await page.getByRole('button', { name: /review/i }).click()
  await settle(page)
  await expect(page.getByRole('heading', { name: 'Review and confirm' })).toBeVisible()
  await settle(page)
  await page.getByRole('checkbox', { name: /I authorize this payroll run/ }).check()
  await page.getByRole('heading', { name: 'Review and confirm' }).scrollIntoViewIfNeeded()
  await capture(page, 'payroll-review')
  await page.getByRole('button', { name: /Execute payroll/ }).click()
  await settle(page)
  await expect(page.getByRole('progressbar', { name: 'Payroll progress' })).toBeVisible()
  await page.clock.runFor(7000)
  await expect(page.getByRole('status').filter({ hasText: /^Payroll complete$/ })).toBeVisible()
  await page
    .getByRole('status')
    .filter({ hasText: /^Payroll complete$/ })
    .scrollIntoViewIfNeeded()
  await capture(page, 'payroll-complete')
})
