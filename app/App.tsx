import { useEffect, useRef, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import railcasts from 'react-syntax-highlighter/dist/esm/styles/hljs/railscasts';

import './index.css';

import CurrencyInput from '../lib';

SyntaxHighlighter.registerLanguage('javascript', javascript);

const defaultValue = 0.0;
const maxValue = 999999999.99;
const regex = /"([\w]+)":/g;
const subst = '$1:';

function BrlCurrencyInput() {
  const [value, setValue] = useState(defaultValue);
  const [maskedValue, setMaskedValue] = useState('R$ 0,00');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <>
      <CurrencyInput
        ref={inputRef}
        currency='BRL'
        locale='pt-BR'
        onValueChange={(currentValue, currentMaskedValue) => {
          setValue(currentValue);
          setMaskedValue(currentMaskedValue);
        }}
        defaultValue={defaultValue}
        max={maxValue}
        autoFocus={true}
      />
      <p>Value: <strong id='currentValue'>{value}</strong></p>
      <p>Masked Value: <strong id='maskedValue'>{maskedValue}</strong></p>
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
          {JSON.stringify({ locale: 'pt-BR', currency: 'BRL' }, null, 2).replace(regex, subst)}
        </SyntaxHighlighter>
        <p>Just input some amount to see the returned values:</p>
        <BrlCurrencyInput />
      </section>
    </main>
  );
}

export default App;
