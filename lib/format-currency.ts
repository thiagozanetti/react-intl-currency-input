import Big from "big.js";

import { IntlFormatterConfig } from "./types";

export default function formatCurrency(value: number, localeConfig: IntlFormatterConfig, currencyName: string) {
  const numberConfig = localeConfig.formats.number[currencyName];
  const formatter = new globalThis.Intl.NumberFormat(localeConfig.locale, numberConfig);

  return formatter.format(Big(value).toNumber());
}
