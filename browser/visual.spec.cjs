const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

async function screenshot(page, name) {
  try {
    await expect(page).toHaveScreenshot(name, { fullPage: true, animations: 'disabled' });
  } finally {
    fs.mkdirSync('test-results/visual-receipts', { recursive: true });
    await page.screenshot({ path: `test-results/visual-receipts/${name}`, fullPage: true, animations: 'disabled' });
  }
}

// This suite cannot contact analytics, GitHub, Formspree, reCAPTCHA or other
// external services. Screenshots contain only the template's public content.
test.afterEach(async ({ page }, info) => {
  if (process.env.SCREENSHOT_LOGS === '1') {
    const bytes = await page.screenshot({ type: 'jpeg', quality: 60, fullPage: true, animations: 'disabled' });
    console.log(`PORTFOLIO_SCREENSHOT_${info.title.startsWith('mobile') ? 'MOBILE' : 'DESKTOP'}=${bytes.toString('base64')}`);
  }
});

test.beforeEach(async ({ context, baseURL }) => {
  // Normalize the historical template's 'system' theme for pixel comparison.
  // Navigation tests independently verify the upgraded default-system toggle.
  await context.addInitScript(() => localStorage.setItem('theme', 'light'));
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === new URL(baseURL).origin) return route.continue();
    return route.abort();
  });
});

for (const [name, viewport] of [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  test(`${name}: original content, layout and light/dark theme`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { name: 'Hi There!' })).toBeVisible();
    await expect(page.getByText('I’m John and I’m a JAMStack engineer!', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'More about me' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await screenshot(page, `${name}-light.png`);
    if (name === 'mobile') {
      await page.locator('.burger-transition').click();
      await expect(page.getByRole('link', { name: 'About', exact: true }).filter({ visible: true })).toBeVisible();
      await screenshot(page, 'mobile-menu.png');
    }
    await page.getByRole('button', { name: 'Toggle theme' }).filter({ visible: true }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await screenshot(page, `${name}-dark.png`);
    expect(errors).toEqual([]);
    await info.attach('page-content', { body: Buffer.from(await page.locator('body').innerText()), contentType: 'text/plain' });
  });
}
