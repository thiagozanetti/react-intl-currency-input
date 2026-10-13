import { describe, expect, it } from 'vitest';

import { normalizeCurrencyValue } from '../../lib/normalize-currency-value';

describe('normalizeCurrencyValue', () => {
  it('scales a digit stream by maximumFractionDigits', () => {
    expect(normalizeCurrencyValue('12345', { maximumFractionDigits: 0 })).toBe(12345);
    expect(normalizeCurrencyValue('12345', { maximumFractionDigits: 1 })).toBe(1234.5);
    expect(normalizeCurrencyValue('12345', { maximumFractionDigits: 2 })).toBe(123.45);
    expect(normalizeCurrencyValue('12345', { maximumFractionDigits: 3 })).toBe(12.345);
  });

  it('keeps only digits and toggles the sign for each negative marker', () => {
    expect(normalizeCurrencyValue('$1,234.56', { maximumFractionDigits: 2 })).toBe(1234.56);
    expect(normalizeCurrencyValue('-R$ 1.234,56', { maximumFractionDigits: 2 })).toBe(-1234.56);
    expect(normalizeCurrencyValue('--123', { maximumFractionDigits: 2 })).toBe(1.23);
    expect(normalizeCurrencyValue('-', { maximumFractionDigits: 2 })).toBe(0);
    expect(normalizeCurrencyValue('', { maximumFractionDigits: 2 })).toBe(0);
  });

  it('normalizes finite numbers exactly at the public boundary', () => {
    expect(normalizeCurrencyValue(1.005, { maximumFractionDigits: 2 })).toBe(1.01);
    expect(normalizeCurrencyValue(-0, { maximumFractionDigits: 2 })).toBe(0);
    expect(normalizeCurrencyValue(1e3, { maximumFractionDigits: 2 })).toBe(1000);
    expect(normalizeCurrencyValue('12345678901234567890.125', { maximumFractionDigits: 3 })).toBe(
      Number('12345678901234567890.125'),
    );
  });

  it('rejects unsafe or non-finite numeric inputs and invalid fraction settings', () => {
    expect(() => normalizeCurrencyValue(Number.MAX_SAFE_INTEGER + 1, { maximumFractionDigits: 2 })).toThrow(
      /safe integer/i,
    );
    expect(() => normalizeCurrencyValue(Number.NaN)).toThrow(/finite/i);
    expect(() => normalizeCurrencyValue(Number.POSITIVE_INFINITY)).toThrow(/finite/i);
    expect(normalizeCurrencyValue('1e3', { maximumFractionDigits: 2 })).toBe(0.13);
    expect(() => normalizeCurrencyValue('1', { maximumFractionDigits: 21 })).toThrow(/fraction digits/i);
  });
});
