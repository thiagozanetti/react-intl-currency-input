export default function formatCurrency(value: number, localeConfig, currencyName) {
  const numberConfig = localeConfig.formats.number[currencyName];
  const formatter = new global.Intl.NumberFormat(localeConfig.locale, numberConfig);

  return formatter.format(BigInt(value));
}
