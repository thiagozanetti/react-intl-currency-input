import Big from 'big.js';

import { IntlFormatterConfig } from './types';

export function resolveCurrencyFormatOptions(
  locale: string,
  currency: string,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormatOptions {
  const minimumFractionDigits = options.minimumFractionDigits
    ?? (options.maximumFractionDigits === undefined
      ? 2
      : Math.min(2, options.maximumFractionDigits));
  const maximumFractionDigits = options.maximumFractionDigits ?? Math.max(minimumFractionDigits, 2);

  if (
    !Number.isInteger(minimumFractionDigits) ||
    !Number.isInteger(maximumFractionDigits) ||
    minimumFractionDigits < 0 ||
    maximumFractionDigits < 0 ||
    minimumFractionDigits > 20 ||
    maximumFractionDigits > 20 ||
    minimumFractionDigits > maximumFractionDigits
  ) {
    throw new RangeError('Invalid currency format configuration: fraction digits minimum must not exceed maximum');
  }

  try {
    if (globalThis.Intl.NumberFormat.supportedLocalesOf(locale).length === 0) {
      throw new RangeError(`Unsupported locale: ${locale}`);
    }
    new globalThis.Intl.NumberFormat(locale, { ...options, style: 'currency', currency });
  } catch (error) {
    const reason = error instanceof RangeError && /locale/i.test(error.message) ? 'locale' : 'currency or format options';
    throw new RangeError(`Invalid currency format configuration for ${reason}`, { cause: error });
  }

  return {
    ...options,
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  };
}

export function formatCurrency(
  value: number,
  locale: string,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string;
export function formatCurrency(value: number, localeConfig: IntlFormatterConfig, currencyName: string): string;
export function formatCurrency(
  value: number,
  localeOrConfig: string | IntlFormatterConfig,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string {
  if (typeof localeOrConfig !== 'string') {
    const numberConfig = localeOrConfig.formats.number[currency];
    const formatter = new globalThis.Intl.NumberFormat(localeOrConfig.locale, numberConfig);
    return formatter.format(Big(value).toNumber());
  }

  const formatter = new globalThis.Intl.NumberFormat(
    localeOrConfig,
    resolveCurrencyFormatOptions(localeOrConfig, currency, options),
  );

  return formatter.format(Big(value).toNumber());
}

export default formatCurrency;
