import { describe, expect, it } from 'vitest';

import {
  decimalToMinorUnits,
  minorUnitsToDecimal,
  roundDecimalString,
} from '../../lib/currency-decimal';

describe('exact currency decimal utilities', () => {
  it('converts decimal strings to and from exact minor units at each supported scale', () => {
    expect(decimalToMinorUnits('12345', 0)).toBe(12345n);
    expect(decimalToMinorUnits('123.45', 1)).toBe(1235n);
    expect(decimalToMinorUnits('123.45', 2)).toBe(12345n);
    expect(decimalToMinorUnits('12.345', 3)).toBe(12345n);
    expect(minorUnitsToDecimal(12345n, 0)).toBe('12345');
    expect(minorUnitsToDecimal(12345n, 1)).toBe('1234.5');
    expect(minorUnitsToDecimal(12345n, 2)).toBe('123.45');
    expect(minorUnitsToDecimal(12345n, 3)).toBe('12.345');
  });

  it('rounds positive and negative ties away from zero', () => {
    expect(roundDecimalString('1.005', 2)).toBe('1.01');
    expect(roundDecimalString('-1.005', 2)).toBe('-1.01');
    expect(roundDecimalString('1.5', 0)).toBe('2');
    expect(roundDecimalString('-1.5', 0)).toBe('-2');
  });

  it('normalizes negative zero and preserves large decimal strings exactly internally', () => {
    expect(roundDecimalString('-0.004', 2)).toBe('0');
    expect(decimalToMinorUnits('12345678901234567890.125', 3)).toBe(
      12345678901234567890125n,
    );
  });

  it('rejects invalid scales and non-finite decimal values clearly', () => {
    expect(() => decimalToMinorUnits('1', -1)).toThrow(/fraction digits/i);
    expect(() => decimalToMinorUnits('NaN', 2)).toThrow(/finite decimal/i);
    expect(() => decimalToMinorUnits('Infinity', 2)).toThrow(/finite decimal/i);
    expect(() => decimalToMinorUnits('1e3', 2)).toThrow(/decimal/i);
  });
});
