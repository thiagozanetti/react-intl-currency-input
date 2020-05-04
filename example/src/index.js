import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import gist from 'react-syntax-highlighter/dist/esm/styles/hljs/github-gist';

import IntlCurrencyInput from 'react-intl-currency-input';

import './index.css';
import * as serviceWorker from './serviceWorker';

SyntaxHighlighter.registerLanguage('javascript', javascript);

const currencyConfig = {
  locale: 'pt-BR',
  formats: {
    number: {
      BRL: {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
};

// a little hack to make highlighting work.
const stripKeyQuotes = strObj => {
  const regex = /"([\w]+)":/g;
  const subst = `$1:`;

  return strObj.replace(regex, subst);
};

const defaultValue = 10.00;
const maxValue = 999999999.99;

const BrlCurrencyInput = () => {
  const [value, setValue] = useState(defaultValue);
  const [maskedValue, setMaskedValue] = useState('R$1.234,56');

  const handleChange = (event, value, maskedValue) => {
    event.preventDefault();

    console.log(value); // value without mask (ex: 1234.56)
    console.log(maskedValue); // masked value (ex: R$1234,56)

    setValue(value);
    setMaskedValue(maskedValue);
  };

  return (
    <div>
      <IntlCurrencyInput currency='BRL' config={currencyConfig}
        defaultValue={defaultValue}
        onChange={handleChange}
        autoFocus={true}
        autoSelect={true}
        max={maxValue}
      />
      <p>Value: <strong>{value}</strong></p>
      <p>Masked Value: <strong>{maskedValue}</strong></p>
      <p>Max Value: <strong>{maxValue}</strong></p>
    </div>
  );
}
ReactDOM.render(
  <div>
    <h1>
      react-intl-currency-input example
    </h1>
    <p>Using this configuration:</p>
    <SyntaxHighlighter language='javascript' style={gist}>{stripKeyQuotes(JSON.stringify(currencyConfig, null, 2))}</SyntaxHighlighter>
    <p>Just input some amount to see the returned values:</p>
    <BrlCurrencyInput />
  </div>,
document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
