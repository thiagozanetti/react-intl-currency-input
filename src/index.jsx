import React, { Component } from "react"

import formatCurrency from "./format-currency"

const defaultConfig = {
  USD: {
    locale: "en-US",
    formats: {
      number: {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
};

class IntlCurrencyInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maskedValue: "0",
    }
  }

  normalizeValue = str => {
    // strips everything that is not a number (positive or negative).
    return Number(str.replace(/[^0-9-]/g, ""))
  }

  handleChange = event => {
    event.preventDefault();

    // value must be divided by 100 to work with cents.
    const value = normalizeValue(event.target.value) / 100;
    const maskedValue = formatCurrency(value, this.props.config, this.props.currency);

    this.setState({
      maskedValue,
    });

    this.props.onChange(event, value, maskedValue);
  }

  render() {
    return(
      <input value={this.state.maskedValue}
        onChange={this.handleChange} />
    );
  }
};

IntlCurrencyInput.propTypes = {
  currency: React.PropTypes.string.isRequired,
  config: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func,
};

IntlCurrencyInput.defaultProps = {
  currency: "USD",
  config: defaultConfig,
};

export default IntlCurrencyInput;
