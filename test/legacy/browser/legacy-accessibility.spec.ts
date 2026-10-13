import { expect, test } from '@playwright/test';

test.describe('legacy currency input accessibility evidence', () => {
  test('exposes a textbox, keyboard focus, and the legacy absence of validation state', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox');

    await expect(input).toBeVisible();
    await expect(input).not.toHaveAttribute('type');
    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveAccessibleName('');
  });
});
