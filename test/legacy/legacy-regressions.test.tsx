import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import IntlCurrencyInput from './LegacyIntlCurrencyInput';
import { IntlFormatterConfig } from '../../lib/types';

const usdConfig: IntlFormatterConfig = {
  locale: 'en-US',
  formats: {
    number: {
      USD: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
};

describe('legacy regression fixes', () => {
  it('treats controlled value zero as authoritative over defaultValue', () => {
    render(
      <IntlCurrencyInput
        currency="USD"
        config={usdConfig}
        value={0}
        defaultValue={56.78}
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('$0.00');
  });

  it('enforces a zero max and does not emit a callback for a rejected edit', () => {
    const onChange = vi.fn();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} max={0} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '100' } });

    expect(input).toHaveValue('$0.00');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('resets the rendered value on blur when autoReset is enabled', () => {
    render(
      <IntlCurrencyInput
        currency="USD"
        config={usdConfig}
        defaultValue={12.34}
        autoReset
      />,
    );
    const input = screen.getByRole('textbox');

    fireEvent.blur(input);

    expect(input).toHaveValue('$0.00');
  });

  it('applies autoFocus through the legacy inputRef object', () => {
    const inputRef = { current: null as HTMLInputElement | null };
    render(
      <IntlCurrencyInput
        currency="USD"
        config={usdConfig}
        inputRef={inputRef}
        autoFocus
      />,
    );

    expect(inputRef.current).toHaveFocus();
  });

  it('applies autoFocus through the legacy inputRef callback', () => {
    let input: HTMLInputElement | null = null;
    const inputRef = (element: HTMLInputElement | null) => {
      input = element;
    };

    render(
      <IntlCurrencyInput
        currency="USD"
        config={usdConfig}
        inputRef={inputRef}
        autoFocus
      />,
    );

    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input).toHaveFocus();
  });

  it('does not mutate the caller config while applying legacy fraction padding', () => {
    const config: IntlFormatterConfig = {
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
    };

    render(<IntlCurrencyInput currency="USD" config={config} defaultValue={1.2} />);

    expect(config.formats.number.USD.minimumFractionDigits).toBe(0);
  });
});
