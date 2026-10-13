import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import IntlCurrencyInput from './LegacyIntlCurrencyInput';

describe('legacy configuration behavior', () => {
  it('throws when the selected currency has no format entry', () => {
    expect(() => render(<IntlCurrencyInput currency="EUR" />)).toThrow();
  });

  it('throws when the currency format entry is missing from an otherwise shaped config', () => {
    expect(() => render(
      <IntlCurrencyInput
        currency="USD"
        config={{ locale: 'en-US', formats: { number: {} } }}
      />,
    )).toThrow();
  });

  it('uses maximumFractionDigits to overwrite minimumFractionDigits in the legacy config', () => {
    render(
      <IntlCurrencyInput
        currency="USD"
        config={{
          locale: 'en-US',
          formats: {
            number: {
              USD: {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
              },
            },
          },
        }}
        defaultValue={1.2}
      />,
    );

    expect(document.querySelector('input')).toHaveValue('$1.200');
  });
});
