import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  testMatch: 'browser/**/*.spec.ts',
  testIgnore: 'legacy/**',
  fullyParallel: false,
  forbidOnly: true,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results/modern',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixels: 100,
    },
  },
  webServer: {
    command: 'vite app --port 3000 --host 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
