const { test, expect } = require('@playwright/test');
const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

// A local mock, never a solved live CAPTCHA. All third-party traffic is either
// answered by these fixtures or blocked; no real message leaves the browser.
const captchaMock = `
window.syntheticCaptchaCount = 0;
window.grecaptcha = {
  ready: (callback) => callback(),
  render: (element, options) => {
    const target = typeof element === 'string' ? document.getElementById(element) : element;
    const verify = document.createElement('button');
    verify.type = 'button'; verify.textContent = 'Verify synthetic CAPTCHA';
    verify.onclick = () => options.callback('synthetic-captcha-response-' + (++window.syntheticCaptchaCount));
    target.appendChild(verify);
    window.expireSyntheticCaptcha = () => options['expired-callback']();
    return 0;
  },
  getResponse: () => 'synthetic-captcha-response', reset: () => {}, execute: () => {}
};
// The provider callback runs after api.js has loaded, as the real bootstrap does.
document.currentScript.addEventListener('load', () => window.onloadcallback && window.onloadcallback(), { once: true });
`;

async function setup({ context, baseURL, page }, mode = 'success') {
  const requests = [];
  let currentMode = mode;
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(baseURL).origin) return route.continue();
    if (url.hostname === 'www.google.com' && url.pathname === '/recaptcha/api.js') {
      return route.fulfill({ contentType: 'application/javascript', body: captchaMock });
    }
    if (url.hostname === 'formspree.io' && url.pathname === '/f/synthetic-form-id') {
      requests.push(route.request().postDataJSON());
      if (currentMode === 'network-error') return route.abort();
      if (currentMode === 'provider-error') return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ errors: [{ field: 'email', message: 'Synthetic provider rejected this email', code: 'TYPE_EMAIL' }] }) });
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ next: '/thank-you' }) });
    }
    return route.abort();
  });
  await page.goto('/#contact');
  // The theme control is client-only, so its presence confirms hydration.
  await expect(page.getByRole('button', { name: 'Toggle theme' }).filter({ visible: true })).toBeVisible();
  return { requests, setMode: value => { currentMode = value; } };
}

async function fill(page) {
  await page.getByRole('textbox', { name: 'name', exact: true }).fill('Synthetic Test');
  await page.getByRole('textbox', { name: 'email', exact: true }).fill('synthetic@example.com');
  await page.getByRole('textbox', { name: 'message', exact: true }).fill('Synthetic local browser fixture; never transmitted.');
  await expect(page.getByRole('textbox', { name: 'name', exact: true })).toHaveValue('Synthetic Test');
  await expect(page.getByRole('textbox', { name: 'email', exact: true })).toHaveValue('synthetic@example.com');
  await expect(page.getByRole('button', { name: 'Verify synthetic CAPTCHA' })).toBeVisible();
}

test('required fields and CAPTCHA prevent submission; verified data goes only to mock', async ({ page, context, baseURL }) => {
  const fixtures = { page, context, baseURL };
  const { requests } = await setup(fixtures);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Full name field is required')).toBeVisible();
  await expect(page.getByText('Email field is required')).toBeVisible();
  await expect(page.getByText('Message field is required')).toBeVisible();
  expect(requests).toHaveLength(0);
  await fill(page);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Robots are not welcome yet!')).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Verify synthetic CAPTCHA' }).click();
  await page.getByRole('button', { name: 'Submit', exact: true }).dblclick();
  await expect(page.getByRole('status')).toContainText('Your message has been successfully sent');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({ name: 'Synthetic Test', email: 'synthetic@example.com', 'g-recaptcha-response': 'synthetic-captcha-response-1' });
  await expect(page.getByRole('textbox', { name: 'name', exact: true })).toHaveValue('');
});

for (const mode of ['provider-error', 'network-error']) {
  test(`${mode}: preserves input and allows retry`, async ({ page, context, baseURL }) => {
    const fixtures = { page, context, baseURL };
    const { requests, setMode } = await setup(fixtures, mode);
    await fill(page);
    await page.getByRole('button', { name: 'Verify synthetic CAPTCHA' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('form').getByRole('alert')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'name', exact: true })).toHaveValue('Synthetic Test');
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
    if (mode === 'provider-error') await expect(page.getByText('Synthetic provider rejected this email')).toBeVisible();
    expect(requests).toHaveLength(1);
    setMode('success');
    await page.getByRole('button', { name: 'Verify synthetic CAPTCHA' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Your message has been successfully sent');
    expect(requests).toHaveLength(2);
    expect(requests[1]['g-recaptcha-response']).toBe('synthetic-captcha-response-2');
  });
}

test('expired CAPTCHA must be verified again', async ({ page, context, baseURL }) => {
  const fixtures = { page, context, baseURL };
  const { requests } = await setup(fixtures);
  await fill(page);
  await page.getByRole('button', { name: 'Verify synthetic CAPTCHA' }).click();
  await page.evaluate(() => window.expireSyntheticCaptcha());
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Robots are not welcome yet!')).toBeVisible();
  expect(requests).toHaveLength(0);
});
