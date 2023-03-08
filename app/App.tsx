import { ChangeEvent, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import railcasts from 'react-syntax-highlighter/dist/esm/styles/hljs/railscasts';

import './index.css';

import ReactIntlCurrencyInput from '../lib';
import { IntlFormatterConfig } from '../lib/types';

SyntaxHighlighter.registerLanguage('javascript', javascript);

const currencyConfig: IntlFormatterConfig = {
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

const defaultValue = 0.0;
const maxValue = 999999999.99;
const regex = /"([\w]+)":/g;
const subst = '$1:';

function BrlCurrencyInput() {
  const [value, setValue] = useState(defaultValue);
  const [maskedValue, setMaskedValue] = useState('R$0,00');

  const handleChange = (event: ChangeEvent, currentValue: number, currentMaskedValue: string) => {
    event.preventDefault();

    console.log(currentValue); // value without mask (ex: 1234.56)
    console.log(currentMaskedValue); // masked value (ex: R$1234,56)

    setValue(currentValue);
    setMaskedValue(currentMaskedValue);
  };

  return (
    <>
      <ReactIntlCurrencyInput
        currency='BRL'
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
    </>
  );
}

function App() {
  return (
    <main>
      <section>
        <h1>react-intl-currency-input example</h1>
        <p>Using this configuration:</p>
        <SyntaxHighlighter language='javascript' style={railcasts}>
          {JSON.stringify(currencyConfig, null, 2).replace(regex, subst)}
        </SyntaxHighlighter>
        <p>Just input some amount to see the returned values:</p>
        <BrlCurrencyInput />
      </section>
    </main>
  );
}

export default App;