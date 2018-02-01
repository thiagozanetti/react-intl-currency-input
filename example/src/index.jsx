import React, { Component } from "react"
import ReactDom from "react-dom"

import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/dist/light"
import javascript from "react-syntax-highlighter/languages/hljs/javascript"
import gist from "react-syntax-highlighter/dist/styles/hljs/github-gist"

import IntlCurrencyInput from "../../src"

import "./index.css"

registerLanguage("javascript", javascript);

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

// a little hack to make highlighting work.
const stripKeyQuotes = strObj => {
  const regex = /"([\w]+)":/g;
  const subst = `$1:`;

  return strObj.replace(regex, subst);
};

const defaultValue = 1234.56;

class BrlCurrencyInput extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value: defaultValue,
      maskedValue: "R$1234,56",
    };
  }

  handleChange (event, value, maskedValue) {
    event.preventDefault();

    console.log(value); // value without mask (ex: 1234.56)
    console.log(maskedValue); // masked value (ex: R$1234,56)

    this.setState({
      value,
      maskedValue,
    });

  };

  render() {
    return (
      <div>
        <IntlCurrencyInput currency="BRL" config={currencyConfig}
          defaultValue={defaultValue}
          onChange={ (ev, value, maskedValue) => this.handleChange(ev, value, maskedValue) }
          autoFocus={true}
          autoSelect={true}
        />
        <p>value: <strong>{this.state.value}</strong></p>
        <p>maskedValue: <strong>{this.state.maskedValue}</strong></p>
      </div>
    );
  }
}

ReactDom.render(
  <div>
    <h1>
      react-intl-currency-input example
    </h1>
    <p>Using this configuration:</p>
    <SyntaxHighlighter language="javascript" style={gist}>{stripKeyQuotes(JSON.stringify(currencyConfig, null, 2))}</SyntaxHighlighter>
    <p>Just input some amount to see the returned values:</p>
    <BrlCurrencyInput />
  </div>,
  document.getElementById("root"));
