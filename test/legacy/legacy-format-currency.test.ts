import { describe, expect, it } from 'vitest';

import formatCurrency from '../../lib/format-currency';
import type { IntlFormatterConfig } from '../../lib/types';

const config: IntlFormatterConfig = {
  locale: 'en-US',
  formats: {
    number: {
      USD: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      JPY: {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      },
    },
  },
};

describe('legacy formatCurrency', () => {
  it('formats a positive USD value using the configured locale and currency', () => {
    expect(formatCurrency(1234.56, config, 'USD')).toBe('$1,234.56');
  });

  it('formats zero and negative values through Intl.NumberFormat', () => {
    expect(formatCurrency(0, config, 'USD')).toBe('$0.00');
    expect(formatCurrency(-1234.56, config, 'USD')).toBe('-$1,234.56');
  });

  it('uses the currency entry fraction configuration', () => {
    expect(formatCurrency(1234, config, 'JPY')).toBe('¥1,234');
  });

  it('falls back to the runtime Intl defaults for a missing currency configuration', () => {
    expect(formatCurrency(1, config, 'EUR')).toBe('1');
  });
});
