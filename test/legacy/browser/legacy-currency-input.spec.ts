import { expect, test } from '@playwright/test';

test.describe('legacy currency input interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the zero baseline and reports a positive edit', async ({ page }) => {
    const input = page.locator('input');

    await expect(input).toHaveValue('R$ 0,00');
    await expect(page.locator('#currentValue')).toHaveText('0');
    await expect(page.locator('#maskedValue')).toHaveText('R$ 0,00');

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

  test('characterizes keyboard digit entry and right-edge deletion', async ({ page }) => {
    const input = page.locator('input');

    await input.click();
    await input.pressSequentially('123456');
    await expect(input).toHaveValue('R$ 1.234,56');

    await input.press('Backspace');
    await expect(input).toHaveValue('R$ 123,45');
  });

  test('characterizes sanitized paste-like replacement input', async ({ page }) => {
    const input = page.locator('input');

    await input.fill('R$ 205,00');
    await expect(input).toHaveValue('R$ 205,00');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      elementValueLength('R$ 205,00'),
      elementValueLength('R$ 205,00'),
    ]);
  });
});

function elementValueLength(value: string): number {
  return value.length;
}
