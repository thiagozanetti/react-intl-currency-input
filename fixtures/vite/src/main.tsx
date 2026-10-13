import { StrictMode, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import CurrencyInput from 'react-intl-currency-input';

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <CurrencyInput ref={inputRef} aria-label="Amount" currency="USD" defaultValue={12.34} />;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
