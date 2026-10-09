# React Currency Input Modernization Design

## Status

Draft for review. This document is the design authority for the planned
breaking `1.0.0` modernization of `react-intl-currency-input`.

## Intent and scope

The package will become a stable React currency input for React 18 and 19,
Node 24+, and current TypeScript/Vite/Vitest tooling. The release will keep
the useful currency-input interaction model while replacing the legacy
polymorphic API with a native input API that is precise, typed, accessible,
SSR-safe, and consumable from ESM and CommonJS applications.

The work is intentionally staged:

1. Characterize the existing `0.3.x` behavior, including visual and browser
   behavior, before changing production code.
2. Add regression coverage and fix historical defects without changing the
   current public API.
3. Implement the breaking API and exact numeric model.
4. Modernize package, tooling, CI, fixtures, and documentation.
5. Verify the packed release artifact and prepare version `1.0.0`.

No npm publish, GitHub release, or external tag is authorized by this design.
Prerelease identifiers, if used in a separate release workflow, follow SemVer
such as `1.0.0-alpha.1`, `1.0.0-beta.1`, and `1.0.0-rc.1`; the final package
metadata is `1.0.0`.

## Current behavior characterization

Before the redesign, tests will document the behavior of the current
component rather than infer intended behavior from its types. The
characterization suite will cover:

- initialization from `value`, `defaultValue`, and omitted values;
- the current truthiness behavior around zero and default values;
- integer input interpreted as a minor-unit digit stream;
- decimals, embedded zeroes, negatives, negative zero, and zero callbacks;
- locale/currency/configuration changes and custom fraction digits;
- maximum boundaries and the absence of a minimum boundary;
- formatted output, grouping, currency placement, and narrow layouts;
- focus, auto-focus, auto-select, blur, auto-reset, and selection behavior;
- key-up/legacy `onKeyPress` payloads and callback ordering;
- forwarded custom input components and `inputRef` behavior;
- malformed or incomplete configuration, including the observed runtime
  failures;
- native event values and the component's callback arguments;
- keyboard entry, deletion, paste, selection, focus transitions, and rapid
  prop updates in Chromium, Firefox, and WebKit;
- accessibility tree, labels, focus indication, and visual state.

Every characterization test will be explicitly labeled as legacy behavior or
as a historical regression. A behavior that is intentionally changed for
`1.0.0` will have both a characterization test and a new-contract test so the
breaking change is visible and reviewable.

The example application will receive visual assertions for zero, positive,
negative, custom locale, maximum rejection, focus/selection, and narrow
viewport states. Browser screenshots or equivalent DOM/accessibility evidence
will be retained only where they materially validate layout or interaction.

## Public API

The canonical component is `CurrencyInput`, implemented with
`forwardRef<HTMLInputElement>` and exported both as a named export and as the
default package export.

```ts
export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'onFocus' | 'onBlur' | 'min' | 'max'> {
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

The package will also export public types, `formatCurrency`, and
`normalizeCurrencyValue`. The old `component`, `inputRef`, nested `config`,
`autoReset`, and legacy `onKeyPress` contracts are removed. `autoFocus` is a
native input attribute. The documentation will show replacing `autoSelect`
with a forwarded ref and a focus handler.

## Numeric and editing model

### Public values

Public values are major currency units: `123.45` means 123.45. The public
callback remains a JavaScript `number` for API compatibility and ergonomics.
The documentation will state that JavaScript-number precision limits still
exist at the API boundary.

### Internal exactness

The component will use integer minor units and decimal-string operations
internally. It will not perform currency arithmetic through repeated binary
floating-point multiplication or addition. The effective maximum fraction
digits determines the minor-unit scale. Internal values will be normalized,
rounded, compared to limits, and formatted exactly before conversion to the
public number.

### Digit stream

Only decimal digits and the negative sign are semantic input. Currency symbols,
grouping separators, decimal separators, whitespace, and other characters are
discarded. Pasted formatted values therefore follow the same digit-stream
rules; they do not receive special decimal parsing semantics.

The digit stream uses the effective `maximumFractionDigits`, not a hardcoded
two-digit scale:

```text
maximumFractionDigits: 2  ->  12345 = 123.45
maximumFractionDigits: 3  ->  12345 = 12.345
maximumFractionDigits: 0  ->  12345 = 12345
```

`minimumFractionDigits` controls display padding and does not change the
digit-stream scale. Values supplied through props are rounded to the effective
maximum precision before display and callback emission.

The caret remains at the end of the numeric display. Arrow keys, Home, End,
and arbitrary mouse/touch caret placement do not create a middle-editing mode.
Backspace and Delete remove the rightmost numeric digit on every supported
platform. Typing `-` toggles the sign. Negative zero normalizes to zero.
Documentation will make these interaction rules prominent.

## Formatting and validation

The default effective options are equivalent to:

```ts
{
  style: 'currency',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}
```

The required `currency` prop overrides any conflicting `currency` value in
`formatOptions`. Other options are passed to `Intl.NumberFormat`. Invalid
fraction combinations and unsupported locale/currency values produce clear
configuration errors while retaining the underlying `Intl` error as the
cause.

`min` and `max` reject user edits outside the inclusive range. Rejected edits
do not update state and do not invoke native `onChange` or `onValueChange`.
If a controlled parent supplies an out-of-range value, the component displays
that parent-owned value, exposes invalid state, and emits a development
warning; it does not mutate the prop or throw during render. Invalid
configuration such as `max < min` throws a descriptive configuration error.

The underlying element remains `type="text"` and defaults to
`inputMode="decimal"`. `aria-invalid` is exposed for limit violations while
standard native attributes remain available.

## Controlled and uncontrolled behavior

If `value` is supplied, it is authoritative, including `0`. The display is
always derived from that value and the current locale/currency/options. An
accepted user edit invokes callbacks, but the component does not maintain a
conflicting display value while waiting for the parent to rerender.

If `value` is absent, `defaultValue` initializes internal state and subsequent
accepted edits update that state. `onValueChange` fires once for each accepted
canonical value change, including a nonzero-to-zero transition, but not for
repeated zero edits or formatting-only changes.

Changing locale, currency, or format options reformats the current canonical
value without emitting a value-change callback. Native `onChange` runs before
`onValueChange` for accepted edits. A later `preventDefault()` from the native
callback does not retroactively undo the already-computed component state.

## Package and framework compatibility

React and React DOM become peer dependencies with a compatible range beginning
at React 18.2 and ending before React 20. CI and fixtures verify the latest
React 18 and React 19 releases.

The package publishes:

- ESM and CommonJS JavaScript builds;
- conditional `exports` for import and require;
- `main`, `module`, and `types` metadata;
- declaration files;
- only intended package artifacts in the packed tarball.

Committed fixtures will cover Vite, Next.js, and Remix, including client
rendering, SSR-safe imports, forwarded refs, and package resolution from a
packed tarball.

## Testing strategy

Tests are written test-first. Each new behavior has a failing test observed
before implementation and a passing unit/component suite after implementation.

Unit and React Testing Library coverage will include normalization,
formatting, exact fraction scaling, controlled/uncontrolled state, callbacks,
limits, invalid configuration, locale changes, refs, focus, selection, and
native attributes. Tests will explicitly cover zero, negative zero, negative
values, empty input, only-minus input, custom fraction digits, max/min edges,
rapid updates, malformed configuration, and callback ordering.

Playwright will run the interaction matrix in Chromium, Firefox, and WebKit:

- digit entry and fraction scaling;
- sign toggling;
- Backspace/Delete behavior;
- paste sanitization;
- focus transitions and auto-focus;
- auto-select replacement examples;
- narrow viewport rendering;
- accessibility roles, labels, invalid state, and keyboard operation;
- locale/currency changes and rapid prop updates.

Build verification will include strict typechecking, linting, unit tests,
coverage where configured, all browser projects, library build, example build,
all consumer fixtures, `npm pack` inspection, ESM import, and CommonJS
require. CI will use Node 24+ and current supported GitHub Actions.

## Documentation and migration

The README will be rewritten around the new API and will include controlled
and uncontrolled examples, the digit-stream model, fraction-digit scaling,
callback payloads, native events, limits, refs, auto-focus, the explicit
auto-select replacement, formatting options, accessibility, SSR, and Vite/
Next.js/Remix usage.

The migration guide will provide a complete mapping from `0.3.x`, including
the removed props and callback contract. Legacy behavior that changes will be
called out with before/after examples. Documentation examples are part of the
acceptance criteria and will be compiled or exercised by fixtures where
possible.

The changelog will use Keep a Changelog format with a final `1.0.0` entry and
clear breaking-change and upgrade notes. No external release operation is
included.

## Scope decisions and blockers

Unrelated findings may be included only when they block an acceptance
criterion, compromise package correctness or safety, or invalidate the
release workflow. Other findings will be documented as follow-up issues and
will not expand this implementation.

## Acceptance checklist

- [ ] Legacy behavior is characterized in unit, component, visual, and
  browser tests before redesign.
- [ ] Historical regressions have explicit tests.
- [ ] New component API and exact minor-unit model are implemented.
- [ ] Every corner case in this design has unit and/or browser coverage.
- [ ] React 18 and 19 compatibility is verified.
- [ ] Node 24+ CI, current tooling, and Playwright projects pass.
- [ ] Vite, Next.js, and Remix fixtures resolve ESM/CJS and SSR safely.
- [ ] The packed tarball contains only intended artifacts and declarations.
- [ ] README, migration guide, and changelog document the complete upgrade.
- [ ] Package metadata is `1.0.0`; no external publish/release occurs.
