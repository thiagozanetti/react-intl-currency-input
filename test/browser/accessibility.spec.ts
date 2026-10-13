import { expect, test } from '@playwright/test';

test.describe('CurrencyInput accessibility contract', () => {
  test('exposes a named textbox, description, and native input attributes', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox', { name: 'Amount' });

    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveAttribute('inputmode', 'decimal');
    await expect(input).toHaveAttribute('name', 'amount');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).toHaveAttribute('aria-describedby', 'currency-help');
    await expect(input).toHaveAccessibleDescription(/Enter digits to edit the amount/);
  });

  test('keeps keyboard focus visible and operation keyboard accessible', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox', { name: 'Amount' });

    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).toBeVisible();
    await expect.poll(() => input.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.outlineStyle, style.outlineWidth, style.outlineColor];
    })).toEqual(['solid', '3px', 'rgb(255, 204, 0)']);
    await page.keyboard.type('123');
    await expect(input).toHaveValue('R$ 1,23');
  });

  test('exposes invalid state for an out-of-range controlled value fixture', async ({ page }) => {
    await page.goto('/?controlled=out-of-range');
    const input = page.getByRole('textbox', { name: 'Amount' });

    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('preserves disabled and read-only native behavior', async ({ page }) => {
    await page.goto('/?state=disabled');
    const disabled = page.getByRole('textbox', { name: 'Amount' });
    await expect(disabled).toBeDisabled();

    await page.goto('/?state=readonly');
    const readOnly = page.getByRole('textbox', { name: 'Amount' });
    await expect(readOnly).toHaveAttribute('readonly', '');
    await expect(readOnly).not.toBeEditable();
  });
});
