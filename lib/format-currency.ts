import Big from "big.js";

  const numberConfig = localeConfig.formats.number[currencyName];
  const formatter = new global.Intl.NumberFormat(localeConfig.locale, numberConfig);

  return formatter.format(Big(value).toNumber());
}
