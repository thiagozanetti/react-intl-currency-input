import {
  decimalStringToNumber,
  decimalToMinorUnits,
  minorUnitsToDecimal,
  validateFractionDigits,
} from './currency-decimal';

export interface NormalizeCurrencyValueOptions {
  maximumFractionDigits?: number;
}

function sanitizeDigitStream(value: string): { digits: string; negative: boolean } {
  let negative = false;
  let digits = '';

  for (const character of value) {
    if (character >= '0' && character <= '9') digits += character;
    else if (character === '-') negative = !negative;
  }

  return { digits: digits.replace(/^0+(?=\d)/, ''), negative };
}

export function normalizeCurrencyValue(value: string | number, options: NormalizeCurrencyValueOptions = {}): number {
  const scale = options.maximumFractionDigits ?? 2;
  validateFractionDigits(scale);

  if (typeof value === 'number') {
    return decimalStringToNumber(minorUnitsToDecimal(decimalToMinorUnits(value, scale), scale));
  }

  const sanitized = sanitizeDigitStream(value);
  if (sanitized.digits.length === 0) return 0;

  const minorUnits = BigInt(sanitized.digits) * (sanitized.negative ? -1n : 1n);
  return decimalStringToNumber(minorUnitsToDecimal(minorUnits, scale));
}

export { sanitizeDigitStream };

export default normalizeCurrencyValue;
