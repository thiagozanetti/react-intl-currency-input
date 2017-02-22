import Big from "big.js"

export default function formatCurrency(value, localeConfig, currencyName) {
  const numberConfig = localeConfig.formats.number[currencyName];
  const formatter = new global.Intl.NumberFormat(localeConfig.locale, numberConfig);

  return formatter.format(Big(value));
}
