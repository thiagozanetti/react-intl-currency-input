import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { IntlFormatterConfig } from '../../../lib/types';
import LegacyIntlCurrencyInput from '../LegacyIntlCurrencyInput';

import './legacy-app.css';

const config: IntlFormatterConfig = {
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

function LegacyApp() {
  const [value, setValue] = useState(0);
  const [maskedValue, setMaskedValue] = useState('R$ 0,00');

  return (
    <section>
      <LegacyIntlCurrencyInput
        currency='BRL'
        config={config}
        defaultValue={0}
        max={999999999.99}
        autoFocus
        autoSelect
        onChange={(_event, nextValue, nextMaskedValue) => {
          setValue(nextValue);
          setMaskedValue(nextMaskedValue);
        }}
      />
      <p>
        Value: <strong id='currentValue'>{value}</strong>
      </p>
      <p>
        Masked Value: <strong id='maskedValue'>{maskedValue}</strong>
      </p>
    </section>
  );
}

createRoot(document.getElementById('root')!).render(<LegacyApp />);
