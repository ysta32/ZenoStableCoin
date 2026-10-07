import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/download',
  '/app',
  '/app/payroll',
  '/app/team',
  '/app/treasury',
  '/app/transactions',
  '/app/reports',
  '/app/settings',
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('e2e-seeded')) {
      localStorage.clear()
      sessionStorage.setItem('e2e-seeded', 'true')
    }
    Math.random = () => 0.5
  })
})

for (const route of routes) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('main#main')).toHaveCount(1)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    const report = results.violations
      .map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n')}`)
      .join('\n')
    expect(results.violations, `Violations on ${route}:\n${report}`).toEqual([])
  })
}

test('skip link is the first focusable element and targets main', async ({ page }) => {
  await page.goto('/app')
  await page.keyboard.press('Tab')
  const link = page.getByRole('link', { name: 'Skip to main content' })
  await expect(link).toBeFocused()
  await expect(link).toHaveAttribute('href', '#main')
})
