import { describe, expect, it } from 'vitest';

import formatCurrency, {
  resolveCurrencyFormatOptions,
} from '../../lib/format-currency';

describe('modern currency formatting', () => {
  it('uses currency defaults and requires the currency argument', () => {
    expect(formatCurrency(1234.5, 'en-US', 'USD')).toBe('$1,234.50');
    expect(formatCurrency(1234, 'en-US', 'JPY', { maximumFractionDigits: 0 })).toBe('¥1,234');
  });

  it('overrides a conflicting formatOptions currency while preserving other options', () => {
    expect(
      formatCurrency(1234.5, 'en-US', 'USD', {
        currency: 'EUR',
        currencyDisplay: 'code',
        useGrouping: false,
      }),
    ).toBe('USD 1234.50');
  });

  it('resolves minimum-only options and validates fraction configuration', () => {
    expect(resolveCurrencyFormatOptions('en-US', 'USD', { minimumFractionDigits: 3 })).toEqual(
      expect.objectContaining({
        currency: 'USD',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    );
    expect(formatCurrency(1, 'en-US', 'USD', { maximumFractionDigits: 0 })).toBe('$1');
    expect(formatCurrency(1, 'en-US', 'USD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe(
      '$1',
    );
    expect(() => formatCurrency(1, 'en-US', 'USD', { minimumFractionDigits: 3, maximumFractionDigits: 2 })).toThrow(
      /fraction digits/i,
    );
    expect(() => formatCurrency(1, 'not-a-locale', 'USD')).toThrow(/locale/i);
    expect(() => formatCurrency(1, 'en-US', 'not-a-currency')).toThrow(/currency/i);
  });
});
