import React, { useState, useEffect, useCallback } from 'react';
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
  ...props
}) => {
  const inputRef = useCallback(node => {
    const isActive = node === document.activeElement;

    if (node && autoFocus && !isActive) {
      node.focus();
    }
  }, [autoFocus]);

  const [maskedValue, setMaskedValue] = useState('0');

  const formatValue = useCallback(value => setMaskedValue(formatCurrency(value, config, currency)));
  
  // strips everything that is not a number (positive or negative)
  const normalizeValue = str => Number(str.replace(/[^0-9-]/g, ''));

  const calculateValues = useCallback((inputFieldValue, config, currency) => {
    // value must be divided by 100 to properly work with cents.
    const value = normalizeValue(inputFieldValue) / 100;
    const maskedValue = formatCurrency(value, config, currency);

    return [value, maskedValue];
  });

  const updateValues = (value) => {
    const [calculatedValue, calculatedMaskedValue] = calculateValues(value, config, currency);
    
    if (!max || calculatedValue <= max) {
      setMaskedValue(calculatedMaskedValue);

      return [calculatedValue, calculatedMaskedValue];
    } else {
      return [normalizeValue(maskedValue)/100, maskedValue];
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
    formatValue(currentValue);
  }, [value, defaultValue, formatValue]);

  useEffect(() => {
    const [, maskedValue] = calculateValues(value, config, currency);

    setMaskedValue(maskedValue);
  }, [currency, value, config, calculateValues]);

  return (
    <InputComponent
      {...props}
      ref={inputRef}
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
  component: <input/>,
  currency: 'USD',
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
