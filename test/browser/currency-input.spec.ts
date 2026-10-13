import { expect, test } from '@playwright/test';

test.describe('CurrencyInput browser journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uses the effective fraction scale for digit entry', async ({ page }) => {
    const input = page.locator('input');

    await input.fill('123456');

    await expect(input).toHaveValue('R$ 1.234,56');
    await expect(page.locator('#currentValue')).toHaveText('1234.56');
    await expect(page.locator('#maskedValue')).toHaveText('R$ 1.234,56');
  });

  test('covers zero, one, two, and three fraction-digit browser scales', async ({ page }) => {
    const cases = [
      ['0', 'R$ 12.345'],
      ['1', 'R$ 1.234,5'],
      ['2', 'R$ 123,45'],
      ['3', 'R$ 12,345'],
    ] as const;

    for (const [scale, expected] of cases) {
      await page.goto(`/?locale=pt-BR&currency=BRL&scale=${scale}`);
      const input = page.locator('input');
      await input.fill('12345');
      await expect(input).toHaveValue(expected);
    }
  });

  test('toggles the sign and deletes the rightmost digit with either deletion key', async ({ page }) => {
    const input = page.locator('input');

    await input.fill('123456');
    await input.press('-');
    await expect(input).toHaveValue('-R$ 1.234,56');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      '-R$ 1.234,56'.length,
      '-R$ 1.234,56'.length,
    ]);

    await input.press('Backspace');
    await expect(input).toHaveValue('-R$ 123,45');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      '-R$ 123,45'.length,
      '-R$ 123,45'.length,
    ]);

    await input.press('Delete');
    await expect(input).toHaveValue('-R$ 12,34');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      '-R$ 12,34'.length,
      '-R$ 12,34'.length,
    ]);
  });

  test('sanitizes pasted formatting and keeps only semantic digits and sign', async ({ page }) => {
    const input = page.locator('input');

    await input.press('Control+A');
    await input.evaluate((element) => {
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: () => 'R$ 205,00-' },
      });
      element.dispatchEvent(event);
    });

    await expect(input).toHaveValue('-R$ 205,00');
    await expect(page.locator('#currentValue')).toHaveText('-205');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      '-R$ 205,00'.length,
      '-R$ 205,00'.length,
    ]);
  });

  test('anchors edits at the end after arrows, Home, End, and mouse caret placement', async ({ page }) => {
    const input = page.locator('input');

    await input.fill('123456');
    await expect(input).toHaveValue('R$ 1.234,56');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      'R$ 1.234,56'.length,
      'R$ 1.234,56'.length,
    ]);

    await input.press('ArrowLeft');
    await expect(input).toHaveValue('R$ 1.234,56');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      'R$ 1.234,56'.length,
      'R$ 1.234,56'.length,
    ]);

    await input.press('Home');
    await expect(input).toHaveValue('R$ 1.234,56');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      'R$ 1.234,56'.length,
      'R$ 1.234,56'.length,
    ]);

    await input.press('End');
    await expect(input).toHaveValue('R$ 1.234,56');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      'R$ 1.234,56'.length,
      'R$ 1.234,56'.length,
    ]);

    await input.click({ position: { x: 2, y: 12 } });
    await expect(input).toHaveValue('R$ 1.234,56');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      'R$ 1.234,56'.length,
      'R$ 1.234,56'.length,
    ]);

    await input.press('9');
    await expect(input).toHaveValue('R$ 12.345,69');
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      (await input.inputValue()).length,
      (await input.inputValue()).length,
    ]);
  });

  test('anchors a touch pointer placement at the end', async ({ page }) => {
    const input = page.locator('input');
    await input.fill('123456');
    await input.evaluate((element) => {
      element.setSelectionRange(0, 0);
      element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
    });
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      'R$ 1.234,56'.length,
      'R$ 1.234,56'.length,
    ]);
  });

  test('supports focus transitions, autofocus, and the ref-based auto-select example', async ({ page }) => {
    const input = page.locator('input');

    await expect(input).toBeFocused();
    expect(await input.evaluate((element) => [element.selectionStart, element.selectionEnd])).toEqual([
      0,
      (await input.inputValue()).length,
    ]);

    await page.keyboard.press('Tab');
    await expect(input).not.toBeFocused();
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('renders locale and currency changes from the example configuration', async ({ page }) => {
    await page.goto('/?locale=de-DE&currency=EUR');

    await expect(page.locator('input')).toHaveValue('0,00 €');
    await expect(page.locator('#maskedValue')).toHaveText('0,00 €');
  });

  test('reformats through in-app controls without reloading the document', async ({ page }) => {
    const input = page.locator('input');
    let mainFrameNavigations = 0;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) mainFrameNavigations += 1;
    });

    await input.fill('123456');
    await page.getByRole('button', { name: 'Use US dollars' }).click();
    await expect(input).toHaveValue('$1,234.56');
    await expect(page.locator('#maskedValue')).toHaveText('$1,234.56');
    await page.getByRole('button', { name: 'Use German euros' }).click();
    await expect(input).toHaveValue('1.234,56 €');
    await expect(page.locator('#maskedValue')).toHaveText('1.234,56 €');
    await page.getByRole('button', { name: 'Use Brazilian reais' }).click();
    await expect(input).toHaveValue('R$ 1.234,56');
    expect(mainFrameNavigations).toBe(0);
  });

  test('rejects an edit above max without changing the value or callback counters', async ({ page }) => {
    const input = page.locator('input');

    await expect(page.locator('#nativeChangeCount')).toHaveText('0');
    await input.fill('100000000000');

    await expect(input).toHaveValue('R$ 0,00');
    await expect(page.locator('#currentValue')).toHaveText('0');
    await expect(page.locator('#nativeChangeCount')).toHaveText('0');
  });

  test('keeps a controlled display authoritative while the parent lags', async ({ page }) => {
    await page.goto('/?controlled=lag');
    const input = page.locator('input');

    await input.fill('123456');

    await expect(input).toHaveValue('R$ 0,00');
    await expect(page.locator('#currentValue')).toHaveText('0');
    await expect(page.locator('#nativeChangeCount')).not.toHaveText('0');
  });

  test('allows rapid fixture prop updates without stale formatting', async ({ page }) => {
    await page.getByRole('button', { name: 'Use US dollars' }).click();
    await page.getByRole('button', { name: 'Use German euros' }).click();
    await page.getByRole('button', { name: 'Use Brazilian reais' }).click();

    await expect(page.locator('input')).toHaveValue('R$ 0,00');
    await expect(page.locator('#maskedValue')).toHaveText('R$ 0,00');
  });

  test('remains usable at a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const input = page.locator('input');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('R$ 0,00');
    await expect(page.locator('main')).toHaveCSS('overflow-x', 'hidden');
    expect(await page.evaluate(() => ({
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      mainOverflow: document.querySelector('main')!.scrollWidth - document.querySelector('main')!.clientWidth,
      inputBounds: document.querySelector('input')!.getBoundingClientRect().toJSON(),
      viewportWidth: window.innerWidth,
    }))).toEqual(expect.objectContaining({ documentOverflow: 0, mainOverflow: 0 }));
    expect(await input.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
    })).toEqual(expect.objectContaining({ left: expect.any(Number), right: expect.any(Number) }));
    expect(await input.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth && element.scrollWidth <= element.clientWidth;
    })).toBe(true);
  });
});
