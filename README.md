## react-intl-currency-input

A React component for i18n currency input using [Intl API](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Intl).

### Installation

```sh
$ npm install react-intl-currency-input --save-dev
```

### How to use

```js
import React from "react"
import IntCurrencyInput from "react-intl-currency-input"

const currencyConfig = {
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

const BrlCurrencyComponent = () => {
  const handleChange = (event, value, maskedValue) => {
    event.preventDefault();
    
    console.log(vaue); // value without mask (ex: 1234.56)
    console.log(maskedVaue); // masked value (ex: R$1234,56)
  };
  
  return(
    <IntCurrencyInput currency="BRL" config=currencyConfig
            onChange={handleChange} />
  );
}

export default BrlCurrencyComponent;

```

### Properties

|Name|Type|Default|Description|
|:-:|:-:|:-:|:-|
|currency|string|USD|Sets the [currency code](http://www.xe.com/iso4217.php)|
|config|object|USD related configuration|Configuration object compliant with react-intl [intlShape](https://github.com/yahoo/react-intl/wiki/API#intlshape)|
|autoFocus|boolean|false|Enables auto-focus when the component gets displayed|
|autoSelect|boolean|false|Enables auto-select when the component gets displayed|
|autoReset|boolean|false|Resets component's internal state when loses focus|
|onChange|function|undefined|`(event, value, maskedValued) => {}`<br><br>Exposes the `Event` itself, the `value` with no mask and `maskedValue` for displaying purposes|
|onFocus|function|undefined|`(event) => {}`<br><br>Called when the component gains focus|
|onBlur|function|undefined|`(event) => {}`<br><br>Called when the component loses focus|
|onKeyPress|function|undefined|`(event) => {}`<br><br>Called when a `key` is pressed|

All other undocumented properties available for any `React Component` should be available.
