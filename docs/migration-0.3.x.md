# Migrating from 0.3.x to 1.0.0

Version 1.0 replaces the polymorphic 0.3.x API with a native input API. This is a breaking release.

## Basic component and configuration

```tsx
// 0.3.x
<IntlCurrencyInput currency="BRL" config={config} defaultValue={1234.56} onChange={(event, value, maskedValue) => save(value, maskedValue)} />
```

```tsx
// 1.0.0
<CurrencyInput currency="BRL" locale="pt-BR" formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} defaultValue={1234.56} onValueChange={(value, formattedValue) => save(value, formattedValue)} />
```

The import is now `CurrencyInput` (the default export remains available), `currency` is required, `locale` is a string prop, and formatting options are flat `formatOptions`. Public values are major units; internally 1.0 uses exact minor-unit/decimal handling.

### Before and after: digit entry and deletion

In 0.3.x, a formatted change callback received extra arguments and integer
normalization depended on the legacy two-fraction configuration. In 1.0.0,
the native event is followed by `onValueChange`, and the digit stream always
uses the effective `maximumFractionDigits`:

```tsx
// 0.3.x: integer input was interpreted through the nested config and
// onChange received (event, value, maskedValue).
<IntlCurrencyInput config={config} onChange={(event, value, masked) => save(value, masked)} />

// 1.0.0: 12345 means 123.45 at scale 2 and 12.345 at scale 3.
<CurrencyInput
  currency="USD"
  formatOptions={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }}
  onChange={(event) => observe(event.target.value)}
  onValueChange={(value, formatted) => save(value, formatted)}
/>
```

Backspace and Delete remove the rightmost digit, regardless of caret position;
typing `-` toggles the sign; empty, minus-only, and negative-zero input becomes
zero. These are intentional 1.0 editing rules, not browser text-editing rules.

## Removed legacy props

### `component`

Custom component injection is removed. Render `CurrencyInput` as a native input and style it with CSS or wrap it in your own field component.

```tsx
// 0.3.x: component={MyInput}
// 1.0.0:
<label>Amount <CurrencyInput currency="USD" className="amount" /></label>
```

### `inputRef`

Use the standard forwarded ref instead:

```tsx
const inputRef = useRef<HTMLInputElement>(null);
<CurrencyInput ref={inputRef} currency="USD" />
```

### `config`

Replace `config.locale` with `locale` and the nested currency format with `formatOptions`. The `currency` prop is authoritative even if options contain another currency.

```tsx
<CurrencyInput currency="EUR" locale="fr-FR" formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
```

### `autoReset`

There is no automatic reset-on-blur behavior. Keep the value in a controlled parent and reset it explicitly from `onBlur`:

```tsx
const [value, setValue] = useState(0);
<CurrencyInput currency="USD" value={value} onValueChange={setValue} onBlur={() => setValue(0)} />
```

### `autoSelect`

Use the native focus event (or a forwarded ref):

```tsx
<CurrencyInput currency="USD" autoFocus onFocus={(event) => event.currentTarget.select()} />
```

`autoFocus` remains a native input attribute.

### `onKeyPress`

The legacy `onKeyPress(event, key, keyCode)` contract is removed. Use native `onKeyDown` for observation or keyboard-specific behavior. Currency editing is built in: `-` toggles the sign, while Backspace and Delete remove the rightmost digit.

```tsx
<CurrencyInput currency="USD" onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} />
```

## Callback contract changes

In 0.3.x, `onChange`, `onFocus`, and `onBlur` received extra value and masked value arguments. In 1.0 they are standard React native event handlers:

```tsx
<CurrencyInput currency="USD" onChange={(event) => console.log(event.target.value)} onFocus={(event) => event.currentTarget.select()} onBlur={(event) => console.log(event.currentTarget.value)} onValueChange={(value, formattedValue) => console.log(value, formattedValue)} />
```

For accepted edits, `onChange` runs before `onValueChange`. The native event target value is formatted. `onValueChange` receives exactly the canonical major-unit number and formatted string. Rejected `min`/`max` edits invoke neither callback. Formatting-only changes from locale, currency, or options do not invoke `onValueChange`.

### Before and after: limits and zero

The legacy `max` check treated a zero maximum as if no maximum had been set and
used truthiness for controlled values. Version 1.0.0 treats `max={0}` as an
inclusive limit and treats `value={0}` as authoritative. Rejected edits leave
the display and both callbacks unchanged; a controlled out-of-range prop is
displayed with `aria-invalid` and a development warning.

## Controlled state and numeric behavior

Use `value` for controlled state, including zero; use `defaultValue` for uncontrolled initialization. The 1.0 digit stream is scaled by effective `maximumFractionDigits`: `12345` is `12345`, `1234.5`, `123.45`, or `12.345` at scales 0, 1, 2, and 3 respectively. Only digits and minus are semantic; formatted separators and symbols are discarded. The caret stays at the end, minus toggles the sign, and negative zero normalizes to zero.

## Public utility imports

```ts
import { formatCurrency, normalizeCurrencyValue } from 'react-intl-currency-input';
normalizeCurrencyValue('12345', { maximumFractionDigits: 3 }); // 12.345
formatCurrency(12.345, 'en-US', 'USD', { maximumFractionDigits: 3 });
```

The default export is still the component, and named exports include the component, public types, formatter, and normalizer. See the [README](../README.md) for accessibility, SSR, framework, and package-resolution guidance.
