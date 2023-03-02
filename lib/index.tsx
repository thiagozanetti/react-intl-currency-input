import { useState, useEffect, useCallback, useMemo } from 'react';
import { string, func, number, bool, shape, node, oneOfType, instanceOf } from 'prop-types';

import formatCurrency from './format-currency';
import { IntlCurrencyInputProps, IntlFormatterConfig } from './types';

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

const IntlCurrencyInput = ({
  component: InputComponent,
  value,
  defaultValue,
  config,
  currency,
  max,
  autoFocus,
  autoSelect,
  autoReset,
  onChange,
  onBlur,
  onFocus,
  onKeyPress,
  inputRef,
  ...otherProps
}: IntlCurrencyInputProps) => {
  const localInputRef = useCallback((node: any) => {
    const isActive = node === document.activeElement;

    if (node && autoFocus && !isActive) {
      node.focus();
    }
  }, [autoFocus]);

  const [maskedValue, setMaskedValue] = useState('0');

  // to prevent a malformed config object
  const safeConfig = useMemo(() => () => {
    const { formats: { number: { [currency]: { maximumFractionDigits } } } } = config;

    const finalConfig = {
      ...defaultConfig,
      ...config,
    };

    // at the moment this prevents problems when converting numbers
    // with zeroes in-between, otherwise 205 would convert to 25.
    finalConfig.formats.number[currency].minimumFractionDigits = maximumFractionDigits;

    return finalConfig;
  }, [defaultConfig, config]);

  const clean = (value: string | number): number => {
    if (typeof value === 'number') {
      return value;
    }

    // strips everything that is not a number (positive or negative)
    return Number(value.replace(/[^0-9-]/g, ''));
  };

  const normalizeValue = (value: string | number): number => {
    const { formats: { number: { [currency]: { maximumFractionDigits } } } } = safeConfig();
    let safeValue = value;

    if (typeof value === 'string') {
      safeValue = clean(value);

      if (safeValue % 1 !== 0) {
        safeValue = safeValue.toFixed(maximumFractionDigits!);
      }
    } else {
      // all input numbers must be a float point (for the cents portion). This is a fallback in case of integer ones.
      safeValue = Number.isInteger(safeValue) ? Number(safeValue) * (10 ** maximumFractionDigits!) : Number(safeValue).toFixed(maximumFractionDigits!);
    }

    // divide it by 10 power the maximum fraction digits.
    return clean(safeValue) / (10 ** maximumFractionDigits!);
  };

  const calculateValues = (inputFieldValue: number): [number, string] => {
    const value = normalizeValue(inputFieldValue);
    const maskedValue = formatCurrency(value, safeConfig(), currency);

    return [value, maskedValue];
  };

  const updateValues = (value: number) => {
    const [calculatedValue, calculatedMaskedValue] = calculateValues(value);

    if (!max || calculatedValue <= max) {
      setMaskedValue(calculatedMaskedValue);

      return [calculatedValue, calculatedMaskedValue];
    } else {
      return [normalizeValue(maskedValue), maskedValue];
    }
  };

  const handleChange = (event: { preventDefault: () => void; target: { value: number; }; }) => {
    event.preventDefault();

    const [value, maskedValue] = updateValues(event.target.value);

    if (maskedValue) {
      onChange(event, value, maskedValue);
    }
  };

  const handleBlur = (event: { target: { value: number; }; }) => {
    const [value, maskedValue] = updateValues(event.target.value);

    if (autoReset) {
      calculateValues(0);
    }

    if (maskedValue) {
      onBlur(event, value, maskedValue);
    }
  };

  const handleFocus = (event: { target: { select: () => void; value: number; }; }) => {
    if (autoSelect) {
      event.target.select();
    }

    const [value, maskedValue] = updateValues(event.target.value);

    if (maskedValue) {
      onFocus(event, value, maskedValue);
    }
  };

  const handleKeyUp = (event: { key: any; keyCode: any; }) => onKeyPress(event, event.key, event.keyCode);

  useEffect(() => {
    const currentValue = value || defaultValue || 0;
    const [, maskedValue] = calculateValues(currentValue);

    setMaskedValue(maskedValue);
  }, [currency, value, defaultValue, config]);

  return (
    <InputComponent
      {...otherProps}
      ref={inputRef ? inputRef : localInputRef}
      value={maskedValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyUp={handleKeyUp}
    />
  );
};

IntlCurrencyInput.propTypes = {
  defaultValue: number,
  value: number,
  max: number,
  component: node.isRequired,
  currency: string.isRequired,
  config: shape({}).isRequired,
  autoFocus: bool.isRequired,
  autoSelect: bool.isRequired,
  autoReset: bool.isRequired,
  onChange: func.isRequired,
  onBlur: func.isRequired,
  onFocus: func.isRequired,
  onKeyPress: func.isRequired,
  inputRef: oneOfType([
    func,
    shape({ current: instanceOf(Element) })
  ])
};

IntlCurrencyInput.defaultProps = {
  component: 'input',
  currency: 'USD',
  value: 0,
  config: defaultConfig,
  autoFocus: false,
  autoSelect: false,
  autoReset: false,
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
  onKeyPress: () => {},
  inputRef: () => {},
};

export default IntlCurrencyInput;
