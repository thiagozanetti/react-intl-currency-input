import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChangeEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import CurrencyInput from '../../lib';

describe('CurrencyInput public API', () => {
  it('requires currency and renders a native text input with default formatting', () => {
    render(<CurrencyInput currency="USD" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveValue('$0.00');
  });

  it('treats controlled zero as authoritative and initializes uncontrolled values from defaultValue', () => {
    const { rerender } = render(
      <CurrencyInput currency="USD" value={0} defaultValue={12.34} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('$0.00');

    rerender(<CurrencyInput currency="USD" defaultValue={12.34} />);
    expect(screen.getByRole('textbox')).toHaveValue('$12.34');
  });

  it('keeps the initial uncontrolled value when defaultValue changes', () => {
    const { rerender } = render(<CurrencyInput currency="USD" defaultValue={12.34} />);

    rerender(<CurrencyInput currency="USD" defaultValue={56.78} />);

    expect(screen.getByRole('textbox')).toHaveValue('$12.34');
  });

  it('uses the forwarded ref and reformats without a value callback when format props change', () => {
    const ref = { current: null as HTMLInputElement | null };
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CurrencyInput
        ref={ref}
        currency="USD"
        defaultValue={12.34}
        onValueChange={onValueChange}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    rerender(
      <CurrencyInput
        ref={ref}
        currency="EUR"
        locale="de-DE"
        defaultValue={12.34}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('12,34 €');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('emits the native change before the value callback for an accepted edit', () => {
    const calls: string[] = [];
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => {
      calls.push(`change:${event.target.value}`);
    });
    const onValueChange = vi.fn((value: number, formattedValue: string) => {
      calls.push(`value:${value}:${formattedValue}`);
    });

    render(<CurrencyInput currency="USD" onChange={onChange} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '123456' } });

    expect(screen.getByRole('textbox')).toHaveValue('$1,234.56');
    expect(calls).toEqual(['change:$1,234.56', 'value:1234.56:$1,234.56']);
  });

  it('does not leave a controlled display ahead of a lagging parent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CurrencyInput currency="USD" value={1} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.keyboard('{End}2');
    expect(onValueChange).toHaveBeenCalledWith(10.02, '$10.02');

    rerender(<CurrencyInput currency="USD" value={1} onValueChange={onValueChange} />);
    expect(input).toHaveValue('$1.00');
  });

  it('uses a native change event for accepted keyboard edits', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const onChange = vi.fn(() => calls.push('change'));
    const onValueChange = vi.fn(() => calls.push('value'));
    render(<CurrencyInput currency="USD" defaultValue={12.34} onChange={onChange} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].nativeEvent).toBeInstanceOf(Event);
    expect(onChange.mock.calls[0][0].nativeEvent).not.toBeInstanceOf(KeyboardEvent);
    expect(onChange.mock.calls[0][0].target).toBe(input);
    expect(onChange.mock.calls[0][0].target.value).toBe('$1.23');
    expect(calls).toEqual(['change', 'value']);
  });

  it('formats digit streams at the effective maximum fraction scale and anchors deletion at the end', async () => {
    const user = userEvent.setup();
    render(
      <CurrencyInput
        currency="USD"
        formatOptions={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }}
      />,
    );
    const input = screen.getByRole('textbox');

    await user.type(input, '12345');
    expect(input).toHaveValue('$12.345');

    input.setSelectionRange(0, 1);
    await user.keyboard('{Delete}');
    expect(input).toHaveValue('$1.234');
    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it.each([
    [0, 12345, '$12,345'],
    [1, 12345, '$1,234.5'],
    [2, 12345, '$123.45'],
    [3, 12345, '$12.345'],
  ])('uses maximumFractionDigits=%i for the digit stream', async (scale, digits, expected) => {
    const user = userEvent.setup();
    render(
      <CurrencyInput
        currency="USD"
        formatOptions={{ minimumFractionDigits: scale, maximumFractionDigits: scale }}
      />,
    );

    await user.type(screen.getByRole('textbox'), String(digits));

    expect(screen.getByRole('textbox')).toHaveValue(expected);
  });

  it('sanitizes pasted formatting and toggles the sign with minus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CurrencyInput currency="USD" onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    fireEvent.change(input, { target: { value: '$1,234.56-' } });
    expect(input).toHaveValue('-$1,234.56');
    fireEvent.keyDown(input, { key: '-' });
    expect(input).toHaveValue('$1,234.56');
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('$0.00');
    fireEvent.change(input, { target: { value: '-' } });
    expect(input).toHaveValue('$0.00');
  });

  it.each(['Backspace', 'Delete'])('removes the rightmost digit with %s', async (key) => {
    const user = userEvent.setup();
    render(<CurrencyInput currency="USD" defaultValue={12.34} />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard(`{${key}}`);

    expect(input).toHaveValue('$1.23');
    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('suppresses callbacks for rejected edits and preserves inclusive limits after rounding', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <CurrencyInput
        currency="USD"
        defaultValue={1.23}
        min={-1.23}
        max={1.23}
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.change(input, { target: { value: '124' } });
    fireEvent.change(input, { target: { value: '-123' } });
    fireEvent.change(input, { target: { value: '-124' } });

    expect(input).toHaveValue('-$1.23');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('keeps rapid controlled updates authoritative and suppresses formatting-only callbacks', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CurrencyInput currency="USD" value={1.2} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('textbox');

    rerender(<CurrencyInput currency="USD" value={2.3} onValueChange={onValueChange} />);
    rerender(<CurrencyInput currency="EUR" locale="de-DE" value={2.3} onValueChange={onValueChange} />);
    rerender(<CurrencyInput currency="USD" value={3.4} onValueChange={onValueChange} />);

    expect(input).toHaveValue('$3.40');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('rejects edits outside min/max without invoking either callback', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <CurrencyInput
        currency="USD"
        max={10}
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1001' } });

    expect(screen.getByRole('textbox')).toHaveValue('$0.00');
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('rejects an inverted limit configuration', () => {
    expect(() => render(<CurrencyInput currency="USD" min={10} max={1} />)).toThrow(
      /min must not exceed max/i,
    );
  });
});
