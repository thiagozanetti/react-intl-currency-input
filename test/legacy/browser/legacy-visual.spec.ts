import { expect, test } from '@playwright/test';

test.describe('legacy currency input visual evidence', () => {
  test.skip(({ browserName }) => browserName === 'webkit',
    'WebKit visual baselines are platform-specific and are not generated in the Linux test environment; the legacy WebKit journey remains covered by interaction assertions.',
  );

  test('captures deterministic zero, positive, negative, and focused states', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input');

    await expect(page.locator('main')).toHaveScreenshot('legacy-zero.png', { animations: 'disabled' });

    await input.fill('123456');
    await expect(page.locator('main')).toHaveScreenshot('legacy-positive.png', { animations: 'disabled' });

    await input.fill('-123456');
    await expect(page.locator('main')).toHaveScreenshot('legacy-negative.png', { animations: 'disabled' });

    await input.focus();
    await expect(page.locator('main')).toHaveScreenshot('legacy-focused.png', { animations: 'disabled' });
  });
});
