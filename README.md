# react-intl-currency-input

`CurrencyInput` is a typed, accessible React currency input for React 18 and 19. It formats on every edit with `Intl.NumberFormat`, keeps the caret at the end, and exposes public values as major-unit JavaScript numbers.

## Installation

```sh
npm install react-intl-currency-input
```

React and React DOM are peer dependencies (`>=18.2.0 <20`). The package provides ESM, CommonJS, and TypeScript declarations.

## Quick start

```tsx
import CurrencyInput from 'react-intl-currency-input';

export function PriceField() {
  return <CurrencyInput currency="USD" locale="en-US" defaultValue={1234.56} aria-label="Price" />;
}
```

Named exports include the component and utilities:

```tsx
import CurrencyInput, { CurrencyInput, formatCurrency, normalizeCurrencyValue } from 'react-intl-currency-input';
import type { CurrencyInputProps } from 'react-intl-currency-input';
```

## Numeric and editing rules

- Public values are major currency units: `123.45` means 123.45, not 12,345 minor units. Values cross the API as JavaScript `number`s, so normal JavaScript precision limits still apply at that boundary.
- Internal normalization uses exact decimal strings and integer minor units. It does not repeatedly multiply or add binary floating-point values.
- Typing and paste use a digit stream. Only decimal digits and `-` are semantic; currency symbols, separators, whitespace, and decimal marks are discarded. Formatting is applied after every edit.
- The stream is scaled by the effective `maximumFractionDigits`, never by a hardcoded two-digit assumption:

  | `maximumFractionDigits` | digit stream `12345` | public value |
  | ---: | ---: | ---: |
  | `0` | `12345` | `12345` |
  | `1` | `12345` | `1234.5` |
  | `2` | `12345` | `123.45` |
  | `3` | `12345` | `12.345` |

  `minimumFractionDigits` controls display padding; it does not change the stream scale. Prop values are rounded to the effective maximum precision.
- The caret always returns to the end. Arrow keys, Home, End, and placing the mouse caret do not enable middle editing. Backspace and Delete remove the rightmost numeric digit. Typing `-` toggles the sign. **Negative zero** becomes zero; an empty or minus-only stream is also zero.

```ts
normalizeCurrencyValue('12345', { maximumFractionDigits: 3 }); // 12.345
formatCurrency(1234.5, 'pt-BR', 'BRL'); // "R$ 1.234,50" (the space is U+00A0)
```

## Controlled and uncontrolled usage

`value` is authoritative when supplied, including `value={0}`. Use `defaultValue` to initialize an uncontrolled input. Do not pass both unless deliberately migrating between modes.

```tsx
import { useState } from 'react';
import CurrencyInput from 'react-intl-currency-input';

export function ControlledPrice() {
  const [value, setValue] = useState(0);
  return <CurrencyInput currency="EUR" locale="de-DE" value={value} onValueChange={(nextValue, formattedValue) => { setValue(nextValue); console.log(nextValue, formattedValue); }} />;
}
```

Accepted edits call native `onChange` first, then `onValueChange` with `(value: number, formattedValue: string)`. Native `onChange` receives the normal React change event; its `event.target.value` is the formatted string at the time the callback runs. A later `preventDefault()` does not undo the already-computed edit. Rejected edits outside `min`/`max` call neither callback. Repeated edits that keep the canonical value unchanged do not emit `onValueChange`.

Changing `locale`, `currency`, or `formatOptions` reformats the current value without emitting a value-change callback. An out-of-range controlled value is displayed, marked invalid, and warned about in development; it is never mutated during render.

## Locale, currency, formatting, and limits

`currency` is required and wins over a conflicting `currency` in `formatOptions`. The default options are equivalent to:

```ts
{ style: 'currency', minimumFractionDigits: 2, maximumFractionDigits: 2 }
```

Other `Intl.NumberFormatOptions` are supported. The effective fraction range must be valid (`0` through `20`, with minimum no greater than maximum). Invalid locales, currencies, or options throw a descriptive configuration error. `min` and `max` are inclusive and reject user edits outside the range; `max < min` is invalid configuration.

```tsx
<CurrencyInput currency="JPY" locale="ja-JP" formatOptions={{ maximumFractionDigits: 0 }} min={0} max={100000} aria-label="Whole-yen amount" />
```

## Refs, focus, and auto-select

The component forwards a ref to the native `<input>`. `autoFocus` is the native React input attribute. The removed `autoSelect` prop is replaced by a ref and a focus handler:

```tsx
import { useRef } from 'react';
import CurrencyInput from 'react-intl-currency-input';

export function SelectOnFocus() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <CurrencyInput ref={inputRef} currency="USD" defaultValue={12.34} autoFocus onFocus={(event) => { event.currentTarget.select(); }} />;
}
```

## Accessibility

The underlying element is a native `input type="text"` with `inputMode="decimal"` by default. Provide an accessible name with a visible `<label>`/`htmlFor` or `aria-label`, and use `aria-describedby` for help or limit text. Native attributes such as `id`, `name`, `required`, `disabled`, `readOnly`, and `aria-*` are forwarded. `aria-invalid` is exposed for a controlled value outside the inclusive limits.

## SSR and framework usage

The package is safe to import and render on the server; formatting uses the available `Intl` implementation and browser-only ref behavior runs after mount. It works with Vite, Next.js, and Remix package resolution. Import normally in client components when a framework requires an explicit client boundary:

```tsx
// Next.js App Router
'use client';
import CurrencyInput from 'react-intl-currency-input';
```

The repository includes Vite, Next.js, and Remix consumer fixtures and checks ESM import, CommonJS `require`, SSR, hydration, and forwarded refs. The same package entry points work in React 18 and React 19 applications.

## API

```ts
interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'onFocus' | 'onBlur' | 'min' | 'max' | 'type'> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number, formattedValue: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  locale?: string;
  currency: string;
  formatOptions?: Intl.NumberFormatOptions;
  min?: number;
  max?: number;
}
```

The rendered element is always a text input so that formatted currency text and
the end-anchored editing model remain consistent; `type` is intentionally not
accepted as an override. Use `inputMode` to select the appropriate mobile
keyboard.

`CurrencyInput`, `CurrencyInputProps`, `formatCurrency`, and `normalizeCurrencyValue` are named exports. The default export remains the component.

## Development

```sh
npm ci
npm run typecheck
npm run lint
npm run test:unit -- --run
npm run build:all
npm run verify:docs
```

Use Node 24+ and npm 10+. Stable releases use SemVer; prereleases use identifiers such as `1.0.0-alpha.1`, `1.0.0-beta.1`, and `1.0.0-rc.1`.

See [Migration from 0.3.x](docs/migration-0.3.x.md) for the complete breaking-change mapping.
