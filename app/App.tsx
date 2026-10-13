import { useEffect, useRef, useState } from 'react';

import './index.css';

import CurrencyInput from '../lib';

const defaultValue = 0.0;
const maxValue = 999999999.99;
const regex = /"([\w]+)":/g;
const subst = '$1:';

function BrlCurrencyInput() {
  const fixtureParams = new URLSearchParams(window.location.search);
  const initialLocale = fixtureParams.get('locale') ?? 'pt-BR';
  const initialCurrency = fixtureParams.get('currency') ?? 'BRL';
  const initialScale = fixtureParams.has('scale') ? Number(fixtureParams.get('scale')) : undefined;
  const fixtureState = fixtureParams.get('state');
  const controlledLag = fixtureParams.get('controlled') === 'lag';
  const controlledOutOfRange = fixtureParams.get('controlled') === 'out-of-range';
  const [format, setFormat] = useState({
    locale: initialLocale,
    currency: initialCurrency,
    maximumFractionDigits: initialScale,
  });
  const { locale, currency, maximumFractionDigits } = format;
  const [value, setValue] = useState(defaultValue);
  const [maskedValue, setMaskedValue] = useState(
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(defaultValue),
  );
  const [nativeChangeCount, setNativeChangeCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    setMaskedValue(new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits }).format(value));
  }, [currency, locale, maximumFractionDigits, value]);

  return (
    <>
      <CurrencyInput
        ref={inputRef}
        id='currency-input'
        aria-label='Amount'
        aria-describedby='currency-help'
        name='amount'
        required
        currency={currency}
        locale={locale}
        formatOptions={maximumFractionDigits === undefined ? undefined : { maximumFractionDigits }}
        onValueChange={(currentValue, currentMaskedValue) => {
          if (!controlledLag) {
            setValue(currentValue);
            setMaskedValue(currentMaskedValue);
          }
        }}
        onChange={(event) => {
          setNativeChangeCount((count) => count + 1);
          event.preventDefault();
        }}
        defaultValue={defaultValue}
        value={controlledLag ? value : controlledOutOfRange ? maxValue + 1 : undefined}
        max={maxValue}
        disabled={fixtureState === 'disabled'}
        readOnly={fixtureState === 'readonly'}
        autoFocus={true}
      />
      <div className='format-controls' aria-label='Format controls'>
        <button
          type='button'
          onClick={() => setFormat({ locale: 'en-US', currency: 'USD', maximumFractionDigits: undefined })}
        >
          Use US dollars
        </button>
        <button
          type='button'
          onClick={() => setFormat({ locale: 'de-DE', currency: 'EUR', maximumFractionDigits: undefined })}
        >
          Use German euros
        </button>
        <button
          type='button'
          onClick={() => setFormat({ locale: 'pt-BR', currency: 'BRL', maximumFractionDigits: undefined })}
        >
          Use Brazilian reais
        </button>
      </div>
      <p className='sr-only' id='currency-help'>
        Enter digits to edit the amount. The value is limited to {maxValue}.
      </p>
      <p>
        Value: <strong id='currentValue'>{value}</strong>
      </p>
      <p>
        Masked Value: <strong id='maskedValue'>{maskedValue}</strong>
      </p>
      <p className='sr-only'>
        Native changes: <strong id='nativeChangeCount'>{nativeChangeCount}</strong>
      </p>
      <p>
        Max Value: <strong>{maxValue}</strong>
      </p>
    </>
  );
}

function App() {
  return (
    <main>
      <section>
        <h1>react-intl-currency-input example</h1>
        <p>Using this configuration:</p>
        <pre>
          <code>{JSON.stringify({ locale: 'pt-BR', currency: 'BRL' }, null, 2).replace(regex, subst)}</code>
        </pre>
        <p>Just input some amount to see the returned values:</p>
        <BrlCurrencyInput />
      </section>
    </main>
  );
}

export default App;
