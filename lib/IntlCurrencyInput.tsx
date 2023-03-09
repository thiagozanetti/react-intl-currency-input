import { useEffect, useMemo, useRef, useState } from 'react';
import { any, bool, func, instanceOf, node, number, oneOfType, shape, string } from 'prop-types';

import formatCurrency from './format-currency';
import { IntlCurrencyInputProps, IntlFormatterConfig } from './types';

const MINIMUM_FRACTION_DIGITS = 2;
const MAXIMUM_FRACTION_DIGITS = 2;

const defaultConfig: IntlFormatterConfig = {
  locale: 'en-US',
  formats: {
    number: {
      USD: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: MINIMUM_FRACTION_DIGITS,
        maximumFractionDigits: MAXIMUM_FRACTION_DIGITS,
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
  const localInputRef = useRef(null);

  const [maskedValue, setMaskedValue] = useState('0');

  // to prevent a malformed config object
  const safeConfig = useMemo(() => () => {
    const { formats: { number: { [currency]: { maximumFractionDigits = MAXIMUM_FRACTION_DIGITS } } } } = config;

    const finalConfig = {
      ...defaultConfig,
      ...config,
    };

    // at the moment this prevents problems when converting numbers
    // with zeroes in-between, otherwise 205 would convert to 25.
    finalConfig.formats.number[currency].minimumFractionDigits = maximumFractionDigits;

    return finalConfig;
  }, [defaultConfig, config]);

  const clean = (entry: string | number): number => {
    if (typeof entry === 'number') {
      return entry;
    }

    // strips everything that is not a number (positive or negative)
    // also turns negative zeros (-0) into unsigned/positive ones (0)
    return Number(entry.replace(/[^0-9-]/g, '')) || 0;
  };

  const normalizeValue = (entry: string | number): number => {
    const { formats: { number: { [currency]: { maximumFractionDigits = MAXIMUM_FRACTION_DIGITS } } } } = safeConfig();
    let safeValue = entry;

    if (typeof entry === 'string') {
      safeValue = clean(entry);

      if (safeValue % 1 !== 0) {
        safeValue = safeValue.toFixed(maximumFractionDigits);
      }
    } else {
      // all input numbers must be a float point (for the cents portion). This is a fallback in case of integer ones.
      safeValue = Number.isInteger(safeValue) ? Number(safeValue) * (10 ** maximumFractionDigits) : Number(safeValue).toFixed(maximumFractionDigits);
    }

    // divide it by 10 power the maximum fraction digits.
    return clean(safeValue) / (10 ** maximumFractionDigits);
  };

  const calculateValues = (inputFieldValue: number): [number, string] => {
    const localValue = normalizeValue(inputFieldValue);
    const localMaskedValue = formatCurrency(localValue, safeConfig(), currency);

    return [localValue, localMaskedValue];
  };

  const updateValues = (entry: number) => {
    const [calculatedValue, calculatedMaskedValue] = calculateValues(entry);

    if (!max || calculatedValue <= max) {
      setMaskedValue(calculatedMaskedValue);

      return [calculatedValue, calculatedMaskedValue];
    } else {
      return [normalizeValue(maskedValue), maskedValue];
    }
  };

  const handleChange = (event: { preventDefault: () => void; target: { value: number; }; }) => {
    event.preventDefault();

    const [localValue, localMaskedValue] = updateValues(event.target.value);

    if (localMaskedValue) {
      onChange(event, localValue, localMaskedValue);
    }
  };

  const handleBlur = (event: { target: { value: number; }; }) => {
    const [localValue, localMaskedValue] = updateValues(event.target.value);

    if (autoReset) {
      calculateValues(0);
    }

    if (localMaskedValue) {
      onBlur(event, localValue, localMaskedValue);
    }
  };

  const handleFocus = (event: { target: { select: () => void; value: number; }; }) => {
    if (autoSelect) {
      (localInputRef.current as any).select();
    }

    const [localValue, localMaskedValue] = updateValues(event.target.value);

    if (localMaskedValue) {
      onFocus(event, localValue, localMaskedValue);
    }
  };

  const handleKeyUp = (event: { key: any; keyCode: any; }) => onKeyPress(event, event.key, event.keyCode);

  useEffect(() => {
    const currentValue = value || defaultValue || 0;
    const [, localMaskedValue] = calculateValues(currentValue);

    setMaskedValue(localMaskedValue);

    if (autoFocus && localInputRef.current) {
      (localInputRef.current as any).focus();
    }
  }, [autoFocus, autoSelect, currency, value, defaultValue, config]);

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

const checkCurrentPropType = () => Element ? instanceOf(Element) : any;

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
    shape({ current: checkCurrentPropType() })
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
  inputRef: null,
};

export default IntlCurrencyInput;
