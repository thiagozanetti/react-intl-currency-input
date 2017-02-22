## react-intl-currency-input

A React component for i18n currency input using Intl API.

### Installation

```sh
$ npm install react-intl-currency-input --save-dev
```

### How to use

```js
import React from "react"
import IntCurrencyInput from "react-intl-currency-input"

const currencyConfig = {
  BRL: {
    locale: "pt-BR",
    formats: {
      number: {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    }
  }
};

const BrlCurrencyComponent = () => {
  const handleChange = (event, value, maskedValue) => {
    event.preventDefault();

    console.log(vaue); // value without mask (ex: 1234.56)
    console.log(maskedVaue); // masked value (ex: R$1234,56)
  };

  return(
    <IntCurrencyInput currency="BRL" config=currencyConfig
            onChange={this.handleChange} />
  );
}

export default BrlCurrencyComponent;

```
