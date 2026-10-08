const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ context, baseURL }) => {
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL).origin ? route.continue() : route.abort());
});

test('desktop navigation, history, repeated themes and 404 keep working', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('link', { name: 'About', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect.poll(() => page.locator('#about').evaluate(e => Math.abs(e.getBoundingClientRect().top))).toBeLessThan(20);
  await page.getByRole('link', { name: 'Contact', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await page.goBack();
  await expect(page).toHaveURL(/#about$/);
  await page.goForward();
  await expect(page).toHaveURL(/#contact$/);
  await page.getByRole('link', { name: 'John Doe', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  const toggle = page.getByRole('button', { name: 'Toggle theme' }).filter({ visible: true });
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/light/);
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { name: 'NOT FOUND' })).toBeVisible();
  await expect(page).toHaveTitle('404: Not found');
});

test('mobile menu opens repeatedly, closes on Escape and navigates to sections', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (let repeat = 0; repeat < 3; repeat++) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Contact', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

// This explicitly exercises system mode; visual snapshots seed light mode only.
test('system dark theme toggles to light on the first click', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Toggle theme' }).filter({ visible: true }).click();
  await expect(page.locator('html')).toHaveClass(/light/);
});
