import { ChangeEvent, useState } from "react";

import ReactIntlCurrencyInput from "../lib";
import { IntlFormatterConfig } from "../lib/types";

const currencyConfig: IntlFormatterConfig = {
  locale: "pt-BR",
  formats: {
    number: {
      BRL: {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
};

const defaultValue = 0.0;
const maxValue = 999999999.99;

function App() {
  const [value, setValue] = useState(defaultValue);
  const [maskedValue, setMaskedValue] = useState('R$0,00');

  const handleChange = (event: ChangeEvent, value: number, maskedValue: string) => {
    event.preventDefault();

    console.log(value); // value without mask (ex: 1234.56)
    console.log(maskedValue); // masked value (ex: R$1234,56)

    setValue(value);
    setMaskedValue(maskedValue);
  };

  return (
    <main>
      <h1>react-intl-currency-input</h1>
      <ReactIntlCurrencyInput
        currency="BRL"
        config={currencyConfig}
        onChange={handleChange}
        defaultValue={defaultValue}
        max={maxValue}
        autoFocus={true}
        autoSelect={true}
      />
      <p>Value: <strong>{value}</strong></p>
      <p>Masked Value: <strong>{maskedValue}</strong></p>
      <p>Max Value: <strong>{maxValue}</strong></p>
    </main>
  );
}

export default App;