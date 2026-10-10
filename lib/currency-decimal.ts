const MAX_FRACTION_DIGITS = 20;

function assertScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 0 || scale > MAX_FRACTION_DIGITS) {
    throw new RangeError(`maximum fraction digits must be an integer from 0 to ${MAX_FRACTION_DIGITS}`);
  }
}

function expandScientificNotation(value: string): string {
  const match = /^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/.exec(value);
  if (!match) return value;

  const [, sign, integerPart, fractionPart = '', exponentText] = match;
  const digits = integerPart + fractionPart;
  const decimalPosition = integerPart.length + Number(exponentText);

  if (decimalPosition <= 0) return `${sign}0.${'0'.repeat(-decimalPosition)}${digits}`;
  if (decimalPosition >= digits.length) return `${sign}${digits}${'0'.repeat(decimalPosition - digits.length)}`;
  return `${sign}${digits.slice(0, decimalPosition)}.${digits.slice(decimalPosition)}`;
}

function parseDecimal(value: string | number): { negative: boolean; integer: string; fraction: string } {
  const text = typeof value === 'number' ? numberToDecimalString(value) : value.trim();
  const expanded = typeof value === 'string' && /e/i.test(text)
    ? text
    : expandScientificNotation(text);
  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(expanded);
  if (!match) throw new TypeError(`Expected a finite decimal value, received ${String(value)}`);

  return {
    negative: match[1] === '-',
    integer: match[2].replace(/^0+(?=\d)/, ''),
    fraction: match[3] ?? '',
  };
}

function numberToDecimalString(value: number): string {
  if (!Number.isFinite(value)) throw new TypeError('Expected a finite decimal value');
  if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new RangeError('Numeric integer input must be a safe integer');
  }
  return Object.is(value, -0) ? '0' : String(value);
}

export function roundDecimalString(value: string | number, scale: number): string {
  assertScale(scale);
  const parsed = parseDecimal(value);
  const kept = parsed.fraction.slice(0, scale).padEnd(scale, '0');
  const discarded = parsed.fraction.slice(scale);
  let coefficient = BigInt(parsed.integer + (kept || ''));

  if (discarded.length > 0 && discarded[0] >= '5') coefficient += 1n;
  if (coefficient === 0n) return '0';

  const digits = coefficient.toString().padStart(scale + 1, '0');
  const decimal = scale === 0
    ? digits
    : `${digits.slice(0, -scale) || '0'}.${digits.slice(-scale)}`.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  return parsed.negative ? `-${decimal}` : decimal;
}

export function decimalToMinorUnits(value: string | number, scale: number): bigint {
  assertScale(scale);
  const rounded = roundDecimalString(value, scale);
  const parsed = parseDecimal(rounded);
  const magnitude = BigInt(parsed.integer + parsed.fraction.padEnd(scale, '0'));
  return parsed.negative ? -magnitude : magnitude;
}

export function minorUnitsToDecimal(minorUnits: bigint, scale: number): string {
  assertScale(scale);
  const negative = minorUnits < 0n;
  const magnitude = (negative ? -minorUnits : minorUnits).toString().padStart(scale + 1, '0');
  if (scale === 0) return negative ? `-${magnitude}` : magnitude;

  const result = `${magnitude.slice(0, -scale) || '0'}.${magnitude.slice(-scale)}`
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
  return negative ? `-${result}` : result;
}

export function decimalStringToNumber(value: string): number {
  const result = Number(value);
  if (!Number.isFinite(result)) throw new RangeError('Normalized currency value exceeds the JavaScript number range');
  return Object.is(result, -0) ? 0 : result;
}

export function validateFractionDigits(scale: number): void {
  assertScale(scale);
}
