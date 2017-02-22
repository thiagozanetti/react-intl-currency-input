import Big from "big.js"

export default function formatCurrency(value, localeConfig, currencyName) {
  const config = localeConfig[currencyName];
  const formatter = new global.Intl.NumberFormat(config.locale, config.formats.number);

  return formatter.format(Big(value));
}
