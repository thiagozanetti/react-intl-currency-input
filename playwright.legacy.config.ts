import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/legacy/browser',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/legacy', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run start:app',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
