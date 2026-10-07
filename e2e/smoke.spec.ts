import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('e2e-seeded')) {
      localStorage.clear()
      sessionStorage.setItem('e2e-seeded', 'true')
    }
    Math.random = () => 0.5
  })
})

test('landing renders every section and opens the dashboard', async ({ page }) => {
  await page.goto('/')
  const headings = [
    'Payroll that settles in minutes, not days.',
    'Three steps, one ledger.',
    'What a year of payroll costs.',
    'The parts of payroll that usually hurt.',
    'A small API shaped like your payroll.',
    'Side by side.',
    'Straight answers.',
    'Run a payroll end to end, in the browser.',
  ]
  for (const name of headings) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('heading', { name: 'Who is building it.' })).toHaveCount(0)
  await page.getByRole('banner').getByRole('button', { name: 'Open the demo' }).click()
  await expect(page).toHaveURL('/app')
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
})

test('treasury deep link and deposit update the balance and activity', async ({ page }) => {
  await page.goto('/app/treasury')
  await expect(page.getByRole('heading', { name: 'Treasury', exact: true })).toBeVisible()
  await expect(page.getByText('$392,140.00', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Deposit', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Deposit funds' })
  await dialog.getByLabel('Amount in USD').fill('1250.50')
  await dialog.getByLabel('Source', { exact: true }).selectOption('USDC on Base')
  await dialog.getByRole('button', { name: 'Deposit funds', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('$393,390.50', { exact: true })).toBeVisible()
  await expect(page.getByText('Deposit from USDC on Base', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('$393,390.50', { exact: true })).toBeVisible()
})

test('sample CSV can be reviewed, authorized, executed and found in history', async ({ page }) => {
  await page.goto('/app/payroll')
  await page.getByRole('button', { name: 'Import CSV', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Import team from CSV' })
  const chooserPromise = page.waitForEvent('filechooser')
  await dialog.getByRole('button', { name: 'Choose file', exact: true }).click()
  const chooser = await chooserPromise
  await chooser.setFiles(fileURLToPath(new URL('../public/sample-team.csv', import.meta.url)))
  await dialog.getByRole('radio', { name: /Replace team/ }).check()
  await dialog.getByRole('button', { name: 'Replace with 8 members', exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole('list', { name: 'Payroll recipients' }).getByRole('listitem'),
  ).toHaveCount(8)
  await page.getByRole('button', { name: /review/i }).click()
  await expect(page.getByRole('heading', { name: 'Review and confirm' })).toBeVisible()
  await expect(page.getByText('Okafor, Chidi', { exact: true })).toBeVisible()
  const execute = page.getByRole('button', { name: /Execute payroll/ })
  await expect(execute).toHaveText(/\$33,767\.40/)
  await expect(execute).toBeDisabled()
  await page.getByRole('checkbox', { name: /I authorize this payroll run/ }).check()
  await expect(execute).toBeDisabled()
  const confirmTotal = page.getByLabel('Type the total to confirm: 33,767.40')
  await confirmTotal.fill('33,767.41')
  await expect(execute).toBeDisabled()
  await confirmTotal.fill('$33767.40')
  await expect(execute).toBeEnabled()
  await execute.click()
  await expect(page.getByRole('status').filter({ hasText: /^Payroll complete$/ })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('progressbar', { name: 'Payroll progress' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  )
  await expect(
    page.getByRole('list', { name: 'Recipient status' }).getByText('Sent', { exact: true }),
  ).toHaveCount(8)
  await page.reload()
  const history = page.getByRole('region', { name: 'Past runs' })
  const run = history.getByRole('button', { name: /8 recipients.*\$33,767\.40/ })
  await expect(run).toHaveCount(1)
  await run.click()
  await expect(history.getByText('Okafor, Chidi', { exact: true })).toBeVisible()
  await expect(history.getByRole('button', { name: /Download receipt for run/ })).toHaveCount(1)
})

test('theme selection persists across reload', async ({ page }) => {
  await page.goto('/app')
  const dark = page.getByRole('radio', { name: 'Dark', exact: true })
  await dark.click()
  await expect(dark).toBeChecked()
  await page.reload()
  await expect(dark).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Light', exact: true })).not.toBeChecked()
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/app/does-not-exist')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})

test('390px mobile drawer navigates and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/app')
  const sidebar = page.locator('#app-sidebar')
  await expect(sidebar).toBeAttached()
  await expect(sidebar).toBeHidden()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await expect(sidebar).toBeVisible()
  await sidebar.getByRole('button', { name: 'Treasury', exact: true }).click()
  await expect(page).toHaveURL('/app/treasury')
  await expect(page.getByRole('heading', { name: 'Treasury', exact: true })).toBeVisible()
  await expect(sidebar).toBeAttached()
  await expect(sidebar).toBeHidden()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await page.getByRole('button', { name: 'Close menu', exact: true }).click()
  await expect(sidebar).toBeAttached()
  await expect(sidebar).toBeHidden()
})
