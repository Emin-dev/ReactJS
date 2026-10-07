const { test, expect } = require('@playwright/test');

// This suite cannot contact analytics, GitHub, Formspree, reCAPTCHA or other
// external services. Screenshots contain only the template's public content.
test.afterEach(async ({ page }, info) => {
  if (process.env.SCREENSHOT_LOGS === '1') {
    const bytes = await page.screenshot({ type: 'jpeg', quality: 60, fullPage: true, animations: 'disabled' });
    console.log(`PORTFOLIO_SCREENSHOT_${info.title.startsWith('mobile') ? 'MOBILE' : 'DESKTOP'}=${bytes.toString('base64')}`);
  }
});

test.beforeEach(async ({ context, baseURL }) => {
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
    await expect(page).toHaveScreenshot(`${name}-light.png`, { fullPage: true, animations: 'disabled' });
    if (name === 'mobile') {
      await page.locator('.burger-transition').click();
      await expect(page.getByRole('link', { name: 'About', exact: true }).filter({ visible: true })).toBeVisible();
      await expect(page).toHaveScreenshot('mobile-menu.png', { fullPage: true, animations: 'disabled' });
    }
    await page.getByRole('button', { name: 'Toggle theme' }).filter({ visible: true }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page).toHaveScreenshot(`${name}-dark.png`, { fullPage: true, animations: 'disabled' });
    expect(errors).toEqual([]);
    await info.attach('page-content', { body: Buffer.from(await page.locator('body').innerText()), contentType: 'text/plain' });
  });
}
