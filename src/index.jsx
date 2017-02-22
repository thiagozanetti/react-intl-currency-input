import React, { Component } from "react"

import formatCurrency from "./format-currency"

class IntlCurrencyInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "0",
      maskedValue: "",
    }
  }

  normalizeValue = str => {
    return Number(str.replace(/[^0-9]/g, ""))
  }

  handleChange = event => {
    event.preventDefault();

    const value = normalizeValue(event.target.value) / 100;
    const maskedValue = formatCurrency(value);

    this.setState({
      value,
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
  config: React.PropTypes.object,
  onChange: React.PropTypes.func,
}

export default IntlCurrencyInput;
