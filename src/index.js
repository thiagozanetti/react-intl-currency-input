import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { string, func, number, bool, shape, node } from 'prop-types';

import formatCurrency from './format-currency';

const defaultConfig = {
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
  ...otherProps
}) => {
  const inputRef = useCallback(node => {
    const isActive = node === document.activeElement;

    if (node && autoFocus && !isActive) {
      node.focus();
    }
  }, [autoFocus]);

  const [maskedValue, setMaskedValue] = useState('0');

  // to prevent a malformed config object
  const safeConfig = useMemo(() => () => ({ ...defaultConfig, ...config }), [defaultConfig, config]);

  const normalizeValue = number => {
    const { formats: { number: { [currency]: { maximumFractionDigits: numDigits } } } } = safeConfig();
    
    // strips everything that is not a number (positive or negative)
    // then divide it by 10 power the maximum fraction digits.
    return Number(number.toString().replace(/[^0-9-]/g, '')) / 10 ** numDigits;
  };

  const calculateValues = (inputFieldValue) => {
    const value = normalizeValue(inputFieldValue);
    const maskedValue = formatCurrency(value, safeConfig(), currency);

    return [value, maskedValue];
  };

  const updateValues = (value) => {
    const [calculatedValue, calculatedMaskedValue] = calculateValues(value);
    
    if (!max || calculatedValue <= max) {
      setMaskedValue(calculatedMaskedValue);

      return [calculatedValue, calculatedMaskedValue];
    } else {
      return [normalizeValue(maskedValue), maskedValue];
    }
  };

  const handleChange = (event) => {
    event.preventDefault();

    const [value, maskedValue] = updateValues(event.target.value);

    if (maskedValue) {
      onChange(event, value, maskedValue);
    }
  };

  const handleBlur = (event) => {
    const [value, maskedValue] = updateValues(event.target.value);

    if (autoReset) {
      calculateValues(0);
    }

    if (maskedValue) {
      onBlur(event, value, maskedValue);
    }
  };

  const handleFocus = (event) => {
    if (autoSelect) {
      event.target.select();
    }

    const [value, maskedValue] = updateValues(event.target.value);

    if (maskedValue) {
      onFocus(event, value, maskedValue);
    }
  };

  const handleKeyUp = event => onKeyPress(event, event.key, event.keyCode);

  useEffect(() => {
    const currentValue = value || defaultValue || 0;
    const [, maskedValue] = calculateValues(currentValue);

    setMaskedValue(maskedValue);
  }, [currency, value, defaultValue, config]);

  return (
    <InputComponent
      {...otherProps}
      ref={inputRef}
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
  config: shape().isRequired,
  autoFocus: bool.isRequired,
  autoSelect: bool.isRequired,
  autoReset: bool.isRequired,
  onChange: func.isRequired,
  onBlur: func.isRequired,
  onFocus: func.isRequired,
  onKeyPress: func.isRequired,
};

IntlCurrencyInput.defaultProps = {
  component: 'input',
  currency: 'USD',
  value: 0,
  config: defaultConfig,
  autoFocus: false,
  autoSelect: false,
  autoReset: false,
  onChange: f => f,
  onBlur: f => f,
  onFocus: f => f,
  onKeyPress: f => f,
};

export default IntlCurrencyInput;
