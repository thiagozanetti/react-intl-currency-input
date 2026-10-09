import { expect, test } from '@playwright/test';

test.describe('legacy currency input interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the zero baseline and reports a positive edit', async ({ page }) => {
    const input = page.locator('input');

    await expect(input).toHaveValue('R$ 0,00');
    await expect(page.locator('#currentValue')).toHaveText('0');
    await expect(page.locator('#maskedValue')).toHaveText('R$0,00');

    await input.fill('123456');

    await expect(input).toHaveValue('R$ 1.234,56');
    await expect(page.locator('#currentValue')).toHaveText('1234.56');
    await expect(page.locator('#maskedValue')).toHaveText('R$ 1.234,56');
    expect(await input.inputValue()).toBe('R$ 1.234,56');
  });

  test('records legacy negative entry and focus selection behavior', async ({ page }) => {
    const input = page.locator('input');

    await expect(input).toBeFocused();
    await input.fill('-123456');

    await expect(input).toHaveValue('-R$ 1.234,56');
    await expect(page.locator('#currentValue')).toHaveText('-1234.56');
    await input.click();
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      '-R$ 1.234,56'.length,
      '-R$ 1.234,56'.length,
    ]);
  });

  test('keeps the legacy formatted value in a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const input = page.locator('input');

    await expect(input).toBeVisible();
    await expect(input).toHaveValue('R$ 0,00');
    expect(await page.locator('main').screenshot({ animations: 'disabled' })).toBeTruthy();
  });
});
