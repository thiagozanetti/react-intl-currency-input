import { expect, test } from '@playwright/test';

test.describe('CurrencyInput visual states', () => {
  test.skip(({ browserName }) => browserName === 'webkit',
    'WebKit visual baselines are platform-specific and are not generated in the Linux test environment; WebKit interaction and accessibility coverage remains enabled.',
  );

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  });

  test('captures deterministic zero and focused states', async ({ page }) => {
    const main = page.locator('main');
    const input = page.locator('input');

    await input.evaluate((element) => element.blur());
    await expect(main).toHaveScreenshot('currency-zero.png', { animations: 'disabled' });
    await input.focus();
    await expect(main).toHaveScreenshot('currency-focused.png', { animations: 'disabled' });
  });

  test('captures positive and negative formatted states', async ({ page }) => {
    const main = page.locator('main');
    const input = page.locator('input');

    await input.fill('123456');
    await expect(main).toHaveScreenshot('currency-positive.png', { animations: 'disabled' });
    await input.press('-');
    await expect(main).toHaveScreenshot('currency-negative.png', { animations: 'disabled' });
  });

  test('captures locale and narrow viewport output', async ({ page }) => {
    await page.getByRole('button', { name: 'Use German euros' }).click();
    await page.setViewportSize({ width: 360, height: 640 });

    await expect(page.locator('main')).toHaveScreenshot('currency-narrow-eur.png', {
      animations: 'disabled',
    });
  });
});
