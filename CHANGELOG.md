# Changelog

All notable changes are documented here. This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

There are no unreleased changes.

## [1.0.0] - 2026-10-09

The stable release of the modern React currency input API.

### Added

- `CurrencyInput` with a forwarded native input ref and named/default exports.
- Exact internal decimal/minor-unit handling with major-unit public numbers.
- Digit-stream editing scaled by effective `maximumFractionDigits`.
- Locale, currency, `Intl.NumberFormatOptions`, inclusive `min`/`max`, native input attributes, accessibility state, ESM, CommonJS, and declarations.
- React 18/19, Vite, Next.js, Remix, SSR, hydration, and package-boundary verification fixtures.
- Migration documentation for 0.3.x consumers.

### Changed

- Formatting now runs after every edit; the caret stays at the end.
- Backspace/Delete remove the rightmost digit and `-` toggles the sign.
- Accepted edits call native `onChange` before `onValueChange`; rejected limit edits call neither callback.
- Locale, currency, and formatting changes reformat without value callbacks.

### Removed

- Legacy `component`, `inputRef`, nested `config`, `autoReset`, and `onKeyPress` APIs.
- Extra value arguments from `onChange`, `onFocus`, and `onBlur`; these are now standard React native event handlers.

### Release guidance

Prereleases use valid SemVer identifiers such as `1.0.0-alpha.1`, `1.0.0-beta.1`, and `1.0.0-rc.1`.

[Unreleased]: https://github.com/thiagozanetti/react-intl-currency-input/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/thiagozanetti/react-intl-currency-input/releases/tag/v1.0.0
