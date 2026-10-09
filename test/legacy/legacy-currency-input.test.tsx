import { forwardRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import IntlCurrencyInput from '../../lib';
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

const brlConfig: IntlFormatterConfig = {
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

describe('legacy IntlCurrencyInput initialization and numeric behavior', () => {
  it('renders the omitted value as zero with the default USD format', () => {
    render(<IntlCurrencyInput />);

    expect(screen.getByRole('textbox')).toHaveValue('$0.00');
  });

  it('renders defaultValue as a public decimal value', () => {
    render(<IntlCurrencyInput currency="USD" config={usdConfig} defaultValue={1234.56} />);

    expect(screen.getByRole('textbox')).toHaveValue('$1,234.56');
  });

  it('keeps the legacy integer number normalization unchanged', () => {
    render(<IntlCurrencyInput currency="USD" config={usdConfig} defaultValue={1234} />);

    expect(screen.getByRole('textbox')).toHaveValue('$1,234.00');
  });

  it('converts an integer input event into a two-decimal value', () => {
    const onChange = vi.fn();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '123456' } });

    expect(input).toHaveValue('$1,234.56');
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 1234.56, '$1,234.56');
  });

  it('preserves embedded zeroes in a string input', () => {
    render(<IntlCurrencyInput currency="USD" config={usdConfig} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '205' } });

    expect(input).toHaveValue('$2.05');
  });

  it('formats negative values and normalizes a negative zero string', () => {
    const onChange = vi.fn();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '-123456' } });
    expect(input).toHaveValue('-$1,234.56');
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), -1234.56, '-$1,234.56');

    fireEvent.change(input, { target: { value: '-0' } });
    expect(input).toHaveValue('$0.00');
  });

  it('does not call the legacy callback while only formatting props change', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <IntlCurrencyInput currency="USD" config={usdConfig} defaultValue={12.34} onChange={onChange} />,
    );

    rerender(<IntlCurrencyInput currency="BRL" config={brlConfig} defaultValue={12.34} onChange={onChange} />);

    expect(screen.getByRole('textbox')).toHaveValue('R$ 12,34');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the previous display but still invokes onChange with the previous value above max', () => {
    const onChange = vi.fn();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} max={10} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '1001' } });

    expect(input).toHaveValue('$0.00');
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 0, '$0.00');
  });

  it('allows a value above max when max is zero because the legacy guard is truthy-only', () => {
    render(<IntlCurrencyInput currency="USD" config={usdConfig} max={0} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '100' } });

    expect(input).toHaveValue('$1.00');
  });

  it('uses the current value prop when it is truthy and otherwise falls back to defaultValue', () => {
    const { rerender } = render(
      <IntlCurrencyInput currency="USD" config={usdConfig} value={12.34} defaultValue={56.78} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('$12.34');

    rerender(<IntlCurrencyInput currency="USD" config={usdConfig} value={0} defaultValue={56.78} />);
    expect(screen.getByRole('textbox')).toHaveValue('$56.78');
  });
});

describe('legacy IntlCurrencyInput interaction behavior', () => {
  it('supports autoFocus and autoSelect on focus', () => {
    render(<IntlCurrencyInput currency="USD" config={usdConfig} defaultValue={12.34} autoFocus autoSelect />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('forwards the inputRef and emits legacy focus and blur payloads', () => {
    const inputRef = { current: null as HTMLInputElement | null };
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} inputRef={inputRef} onFocus={onFocus} onBlur={onBlur} />);

    fireEvent.focus(inputRef.current!);
    fireEvent.blur(inputRef.current!);

    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(onFocus).toHaveBeenCalledWith(expect.anything(), 0, '$0.00');
    expect(onBlur).toHaveBeenCalledWith(expect.anything(), 0, '$0.00');
  });

  it('emits key, keyCode, and native event through legacy onKeyPress', () => {
    const onKeyPress = vi.fn();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} onKeyPress={onKeyPress} />);
    const input = screen.getByRole('textbox');

    fireEvent.keyUp(input, { key: '5', keyCode: 53 });

    expect(onKeyPress).toHaveBeenCalledWith(expect.anything(), '5', 53);
  });

  it('renders a forwarded custom input component', () => {
    const CustomInput = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>((props, ref) => (
      <input {...props} ref={ref} data-custom="true" />
    ));
    render(<IntlCurrencyInput component={CustomInput} currency="USD" config={usdConfig} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('data-custom', 'true');
  });

  it('sanitizes pasted-looking change values and keeps the caret at the browser-managed end', async () => {
    const user = userEvent.setup();
    render(<IntlCurrencyInput currency="USD" config={usdConfig} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '$1,234.56' } });
    expect(input).toHaveValue('$1,234.56');
    await user.click(input);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('does not visibly reset on blur even when autoReset is enabled', () => {
    render(<IntlCurrencyInput currency="USD" config={usdConfig} defaultValue={12.34} autoReset />);
    const input = screen.getByRole('textbox');

    fireEvent.blur(input);

    expect(input).toHaveValue('$12.34');
  });

  it('reflects rapid controlled prop updates in the latest formatted display', () => {
    function Harness() {
      const [value, setValue] = useState(1.23);
      return (
        <>
          <button type="button" onClick={() => setValue(45.67)}>update</button>
          <IntlCurrencyInput currency="USD" config={usdConfig} value={value} />
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'update' }));

    expect(screen.getByRole('textbox')).toHaveValue('$45.67');
  });
});
