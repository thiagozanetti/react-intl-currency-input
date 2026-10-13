import { formatCurrency } from 'react-intl-currency-input';
import ClientInput from './client-input';

export default function Page() {
  const serverValue = formatCurrency(1, 'en-US', 'USD');
  return <main><output>{serverValue}</output><ClientInput /></main>;
}
