import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';


import App from './App';

describe('App', () => {
  describe('BrlInputComponent', () => {
    it('must display 0 (R$ 0,00) as the default values', () => {
      // given
      const { container } = render(<App />);

      // when

      // then
      expect(container.querySelector('[id="currentValue"]')).toHaveTextContent('0');
      expect(container.querySelector('[id="maskedValue"]')).toHaveTextContent('R$0,00');
    });

    it('must display 1234.56 (R$ 1.234,56) as the result value', async () => {
      // given
      const user = userEvent.setup();
      const { container } = render(<App />);

      const input = container.querySelector('input');

      // when
      if (input) {
        await user.type(input, '123456');
      }

      // then
      expect(input).not.toBeNull();
      expect(container.querySelector('[id="currentValue"]')).toHaveTextContent('1234.56');
      expect(container.querySelector('[id="maskedValue"]')).toHaveTextContent('R$ 1.234,56');
    });

    it('must display -1234.56 (-R$ 1.234,56) as the result value', async () => {
      // given
      const user = userEvent.setup();
      const { container } = render(<App />);

      const input = container.querySelector('input');

      // when
      if (input) {
        await user.keyboard('1[Home]{-}[End]23456');
      }

      // then
      expect(input).not.toBeNull();
      expect(input).toHaveFocus();
      expect(container.querySelector('[id="currentValue"]')).toHaveTextContent('-1234.56');
      expect(container.querySelector('[id="maskedValue"]')).toHaveTextContent('-R$ 1.234,56');
    });
  });
});