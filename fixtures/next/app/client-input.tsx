'use client';

import { useRef } from 'react';
import CurrencyInput from 'react-intl-currency-input';

export default function ClientInput() {
  const ref = useRef<HTMLInputElement>(null);
  return <CurrencyInput ref={ref} aria-label="Client amount" currency="USD" defaultValue={2} />;
}
