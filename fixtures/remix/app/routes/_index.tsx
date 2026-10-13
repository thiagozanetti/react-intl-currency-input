import { useRef } from 'react';
import CurrencyInput from 'react-intl-currency-input';

export default function Index() {
  const ref = useRef<HTMLInputElement>(null);
  return <CurrencyInput ref={ref} aria-label="Amount" currency="USD" defaultValue={3.45} />;
}
