import React, { Component } from "react"
import ReactDom from "react-dom"

import IntCurrencyInput from "../src"

const currencyConfig = {
  locale: "pt-BR",
  formats: {
    number: {
      BRL: {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
};
class BrlCurrencyComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 0,
      maskedValue: "0",
    };
  }
  const handleChange = (event, value, maskedValue) => {
    event.preventDefault();

    console.log(value); // value without mask (ex: 1234.56)
    console.log(maskedValue); // masked value (ex: R$1234,56)

    this.setState({
      value,
      maskedValue,
    });

  };

  render() {
    return(
      <div>
        <IntlCurrencyInput currency="BRL" config={currencyConfig}
                onChange={handleChange}
                autoFocus={true}
                autoSelect={true}
        />
        <p>value: {this.state.value}</p>
        <p>maskedValue: {this.state.maskedValue}</p>
      </div>
    );
  }
}

ReactDom.render(
  <div>
    <h3>
      react-intl-currency-input example
    </h3>
    <label>Just input some amount too see the returned values</label>
    <BrlCurrencyInput />
  </div>
);
