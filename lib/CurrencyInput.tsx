import {
  type ChangeEvent,
  type ChangeEventHandler,
  type ClipboardEvent,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { decimalStringToNumber, decimalToMinorUnits, minorUnitsToDecimal } from './currency-decimal';
import formatCurrency, { resolveCurrencyFormatOptions } from './format-currency';
import { normalizeCurrencyValue, sanitizeDigitStream } from './normalize-currency-value';
import type { CurrencyInputProps } from './types';

function valueToMinorUnits(value: number | undefined, scale: number): bigint {
  return decimalToMinorUnits(value ?? 0, scale);
}

function displayValue(minorUnits: bigint, scale: number): number {
  return decimalStringToNumber(minorUnitsToDecimal(minorUnits, scale));
}

function setCaretToEnd(input: HTMLInputElement | null): void {
  if (!input) return;
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

function setNativeInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(function CurrencyInputInner(
  {
    value,
    defaultValue,
    onChange,
    onValueChange,
    onKeyDown,
    locale = 'en-US',
    currency,
    formatOptions,
    min,
    max,
    inputMode = 'decimal',
    ...inputProps
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isControlled = value !== undefined;
  if (min !== undefined && max !== undefined && min > max) {
    throw new RangeError('CurrencyInput min must not exceed max.');
  }
  const resolvedOptions = useMemo(
    () => resolveCurrencyFormatOptions(locale, currency, formatOptions),
    [currency, formatOptions, locale],
  );
  const scale = resolvedOptions.maximumFractionDigits ?? 2;
  const [uncontrolledState, setUncontrolledState] = useState(() => ({
    minorUnits: valueToMinorUnits(defaultValue, scale),
    scale,
  }));
  const wasControlled = useRef(isControlled);
  const transitionedToUncontrolled = !isControlled && wasControlled.current;
  const uncontrolledMinorUnits =
    uncontrolledState.scale === scale
      ? uncontrolledState.minorUnits
      : decimalToMinorUnits(minorUnitsToDecimal(uncontrolledState.minorUnits, uncontrolledState.scale), scale);

  const propMinorUnits = valueToMinorUnits(value, scale);
  const minMinorUnits = min === undefined ? undefined : decimalToMinorUnits(min, scale);
  const maxMinorUnits = max === undefined ? undefined : decimalToMinorUnits(max, scale);
  const currentMinorUnits = isControlled
    ? propMinorUnits
    : transitionedToUncontrolled
      ? valueToMinorUnits(defaultValue, scale)
      : uncontrolledMinorUnits;
  const currentValue = displayValue(currentMinorUnits, scale);
  const formattedValue = formatCurrency(currentValue, locale, currency, resolvedOptions);
  const outOfRange =
    (minMinorUnits !== undefined && currentMinorUnits < minMinorUnits) ||
    (maxMinorUnits !== undefined && currentMinorUnits > maxMinorUnits);
  const latestFormattedValue = useRef(formattedValue);
  const nativeChangeInFlight = useRef(false);
  latestFormattedValue.current = formattedValue;

  useIsomorphicLayoutEffect(() => {
    setCaretToEnd(inputRef.current);
  }, [formattedValue]);

  useEffect(() => {
    if (transitionedToUncontrolled) {
      setUncontrolledState({ minorUnits: valueToMinorUnits(defaultValue, scale), scale });
    }
    wasControlled.current = isControlled;
  }, [defaultValue, isControlled, propMinorUnits, scale, transitionedToUncontrolled]);

  useEffect(() => {
    const runtimeProcess = (
      globalThis as typeof globalThis & {
        process?: { env?: { NODE_ENV?: string } };
      }
    ).process;
    if (runtimeProcess?.env?.NODE_ENV !== 'production' && isControlled && outOfRange) {
      console.warn('CurrencyInput controlled value is outside the inclusive min/max range.');
    }
  }, [isControlled, outOfRange, value, min, max]);

  const assignRef = (element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (typeof forwardedRef === 'function') forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  };

  const commit = (nextMinorUnits: bigint, event?: ChangeEvent<HTMLInputElement>) => {
    if (
      (minMinorUnits !== undefined && nextMinorUnits < minMinorUnits) ||
      (maxMinorUnits !== undefined && nextMinorUnits > maxMinorUnits)
    ) {
      if (inputRef.current) inputRef.current.value = formattedValue;
      setCaretToEnd(inputRef.current);
      return;
    }

    const nextValue = displayValue(nextMinorUnits, scale);
    const nextFormattedValue = formatCurrency(nextValue, locale, currency, resolvedOptions);

    if (!isControlled) setUncontrolledState({ minorUnits: nextMinorUnits, scale });
    if (event) {
      const input = inputRef.current;
      if (input) input.value = nextFormattedValue;
      onChange?.(event);
      if (input) input.value = isControlled ? latestFormattedValue.current : nextFormattedValue;
    } else {
      const input = inputRef.current;
      if (input) {
        setNativeInputValue(input, nextFormattedValue);
        nativeChangeInFlight.current = true;
        try {
          input.dispatchEvent(new Event('input', { bubbles: true }));
        } finally {
          nativeChangeInFlight.current = false;
          input.value = isControlled ? latestFormattedValue.current : nextFormattedValue;
        }
      }
    }
    setCaretToEnd(inputRef.current);
    if (nextValue !== currentValue) onValueChange?.(nextValue, nextFormattedValue);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (nativeChangeInFlight.current) {
      onChange?.(event);
      return;
    }
    const { digits, negative } = sanitizeDigitStream(event.target.value);
    const nextMinorUnits = BigInt(digits || '0') * (negative ? -1n : 1n);
    commit(nextMinorUnits);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setCaretToEnd(inputRef.current);
      onKeyDown?.(event);
      return;
    }

    if (event.key !== 'Backspace' && event.key !== 'Delete' && event.key !== '-') {
      onKeyDown?.(event);
      return;
    }

    event.preventDefault();
    let nextMinorUnits = currentMinorUnits;
    if (event.key === '-') {
      nextMinorUnits = -nextMinorUnits;
    } else {
      const sign = nextMinorUnits < 0n ? -1n : 1n;
      nextMinorUnits = ((nextMinorUnits < 0n ? -nextMinorUnits : nextMinorUnits) / 10n) * sign;
    }
    commit(nextMinorUnits);
    onKeyDown?.(event);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    inputProps.onPaste?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    const { digits, negative } = sanitizeDigitStream(event.clipboardData.getData('text'));
    const nextMinorUnits = BigInt(digits || '0') * (negative ? -1n : 1n);
    commit(nextMinorUnits);
  };

  return (
    <input
      {...inputProps}
      ref={assignRef}
      type='text'
      inputMode={inputMode}
      value={formattedValue}
      aria-invalid={outOfRange ? true : inputProps['aria-invalid']}
      onChange={handleChange}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onMouseUp={(event) => {
        inputProps.onMouseUp?.(event);
        setCaretToEnd(inputRef.current);
      }}
      onPointerUp={(event) => {
        inputProps.onPointerUp?.(event);
        setCaretToEnd(inputRef.current);
      }}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput, formatCurrency, normalizeCurrencyValue };
export default CurrencyInput;
