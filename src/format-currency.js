import Big from "big.js"

const defaultConfig = {
  USD: {
    locale: "en-US",
    formats: {
      number: {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
  //      decimalSeparator: ".",
  //      thousandSeparator: ",",
      },
    },
  },
};

export default function formatCurrency(value, localeConfig=defaultConfig, currencyName="USD") {
  const config = localeConfig[currencyName];
  const formatter = new global.Intl.NumberFormat(config.locale, config.formats.number);

  return formatter.format(Big(value));
}
