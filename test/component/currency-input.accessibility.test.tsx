import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CurrencyInput from '../../lib';

describe('CurrencyInput accessibility and native attributes', () => {
  it('preserves the native label, description, and input attributes', () => {
    render(
      <>
        <label htmlFor='amount'>Amount</label>
        <p id='amount-help'>Enter the amount in dollars.</p>
        <CurrencyInput
          id='amount'
          currency='USD'
          aria-describedby='amount-help'
          aria-label='Amount'
          required
          disabled
          readOnly
        />
      </>,
    );

    const input = screen.getByRole('textbox', { name: 'Amount' });
    expect(input).toHaveAttribute('aria-describedby', 'amount-help');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
  });

  it('exposes invalid state when a controlled value is outside the limits', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<CurrencyInput currency='USD' value={25} max={10} aria-label='Amount' />);

    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true');
    expect(warning).toHaveBeenCalledWith('CurrencyInput controlled value is outside the inclusive min/max range.');
    warning.mockRestore();
  });
});
