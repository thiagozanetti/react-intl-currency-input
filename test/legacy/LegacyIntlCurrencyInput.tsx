import { useEffect, useMemo, useRef, useState, type Ref } from 'react';
import type React from 'react';

import formatCurrency from '../../lib/format-currency';
import type { IntlCurrencyInputProps, IntlFormatterConfig } from '../../lib/types';

const defaultConfig: IntlFormatterConfig = {
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

type LegacyProps = Partial<IntlCurrencyInputProps> & {
  component?: React.ElementType;
  inputRef?: Ref<HTMLInputElement>;
  [key: string]: unknown;
};

function LegacyIntlCurrencyInput({
  component: InputComponent = 'input',
  value,
  defaultValue,
  config = defaultConfig,
  currency = 'USD',
  max,
  autoFocus = false,
  autoSelect = false,
  autoReset = false,
  onChange = () => undefined,
  onBlur = () => undefined,
  onFocus = () => undefined,
  onKeyPress = () => undefined,
  inputRef,
  ...otherProps
}: LegacyProps) {
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const [maskedValue, setMaskedValue] = useState('0');

  const safeConfig = useMemo(() => {
    const entry = config.formats.number[currency];
    if (!entry) throw new TypeError(`Missing legacy currency format for ${currency}`);
    const maximumFractionDigits = entry.maximumFractionDigits ?? 2;
    return {
      ...config,
      formats: {
        ...config.formats,
        number: {
          ...config.formats.number,
          [currency]: { ...entry, minimumFractionDigits: maximumFractionDigits },
        },
      },
    };
  }, [config, currency]);

  const normalizeValue = (entry: string | number): number => {
    const maximumFractionDigits = safeConfig.formats.number[currency].maximumFractionDigits ?? 2;
    const clean = typeof entry === 'number' ? entry : Number(entry.replace(/[^0-9-]/g, '')) || 0;
    const scaled = typeof entry === 'number'
      ? (Number.isInteger(clean) ? clean * (10 ** maximumFractionDigits) : clean.toFixed(maximumFractionDigits))
      : clean;
    return Number(String(scaled).replace(/[^0-9-]/g, '')) / (10 ** maximumFractionDigits);
  };

  const calculate = (entry: string | number): [number, string] => {
    const normalized = normalizeValue(entry);
    return [normalized, formatCurrency(normalized, safeConfig, currency)];
  };

  useEffect(() => {
    const initial = value !== undefined ? value : (defaultValue ?? 0);
    setMaskedValue(calculate(initial)[1]);
    if (autoFocus) localInputRef.current?.focus();
  }, [autoFocus, config, currency, defaultValue, value]);

  const update = (entry: string | number): [number, string] | undefined => {
    const [nextValue, nextMaskedValue] = calculate(entry);
    if (max !== undefined && nextValue > max) return undefined;
    setMaskedValue(nextMaskedValue);
    return [nextValue, nextMaskedValue];
  };

  const ref = (element: HTMLInputElement | null) => {
    localInputRef.current = element;
    if (typeof inputRef === 'function') inputRef(element);
    else if (inputRef) inputRef.current = element;
  };

  return (
    <InputComponent
      {...otherProps}
      ref={inputRef ? ref : localInputRef}
      value={maskedValue}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const result = update(event.target.value);
        if (result) onChange(event, result[0], result[1]);
      }}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        const [nextValue, nextMaskedValue] = update(event.target.value) ?? calculate(maskedValue);
        if (autoReset) setMaskedValue(calculate(0)[1]);
        onBlur(event, nextValue, nextMaskedValue);
      }}
      onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
        if (autoSelect) event.currentTarget.select();
        const [nextValue, nextMaskedValue] = update(event.target.value) ?? calculate(maskedValue);
        onFocus(event, nextValue, nextMaskedValue);
      }}
      onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => onKeyPress(event, event.key, event.keyCode)}
    />
  );
}

export default LegacyIntlCurrencyInput;
