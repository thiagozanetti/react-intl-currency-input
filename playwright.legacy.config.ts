import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/legacy/browser',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/legacy', open: 'never' }]],
  outputDir: 'test-results/legacy',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'vite test/legacy/browser --port 3000 --host 0.0.0.0',
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
