const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './browser',
  testMatch: '**/*.spec.cjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45000,
  expect: { timeout: 10000, toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BROWSER_BASE_URL || 'http://127.0.0.1:3057',
    browserName: 'chromium',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.BROWSER_BASE_URL ? undefined : {
    command: 'pnpm start --port 3057',
    url: 'http://127.0.0.1:3057',
    reuseExistingServer: false,
    env: { GITHUB_TOKEN: '', NEXT_TELEMETRY_DISABLED: '1' },
  },
});
