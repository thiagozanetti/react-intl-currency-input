# Agent guidance

## Source of truth

For any work on the currency input API, numeric behavior, tests, package
metadata, CI, fixtures, documentation, or release tooling, read
[`docs/superpowers/specs/2026-10-08-react-currency-input-modernization-design.md`](docs/superpowers/specs/2026-10-08-react-currency-input-modernization-design.md)
before editing. It defines the approved design and acceptance criteria.

Treat the existing `0.3.x` implementation as behavior to characterize before
changing it. Record current behavior in tests, including rendered visuals and
browser interactions, then separate intentional `1.0.0` changes from
regressions.

## Required workflow

1. Work in an isolated git worktree for implementation.
2. Use test-first development: write one focused failing test, observe the
   expected failure, implement the smallest change, then run the complete
   relevant suite.
3. Validate component behavior in React Testing Library and in Chromium,
   Firefox, and WebKit when the change affects interaction, focus, selection,
   keyboard input, paste, layout, or accessibility.
4. Use Node 24+ and the repository's lockfile for installs and builds.
5. Before reporting completion, verify typechecking, linting, unit tests,
   browser tests, library build, example build, consumer fixtures, and packed
   package contents as applicable to the change.

## Product rules

- Public currency values are major-unit JavaScript numbers; internal arithmetic
  uses exact minor-unit/decimal handling.
- Digit entry is a minor-unit stream scaled by the effective
  `maximumFractionDigits`, never a hardcoded two digits.
- Only digits and the negative sign are semantic input. Formatting occurs on
  every edit.
- The caret stays at the end. Backspace and Delete remove the rightmost digit;
  `-` toggles the sign. Document these rules prominently.
- `value` is authoritative in controlled mode, including zero. `defaultValue`
  initializes uncontrolled mode.
- Accepted edits invoke native `onChange` before `onValueChange`; rejected
  min/max edits invoke neither callback.
- Locale, currency, and formatting changes reformat without emitting a value
  change.
- The public component is `CurrencyInput` with a forwarded input ref. Preserve
  the default export and add named exports for the component, public types,
  formatter, and normalizer.
- React and React DOM are peer-compatible with React 18 and 19. ESM, CJS,
  declarations, SSR-safe imports, and Vite/Next.js/Remix resolution are part
  of package correctness.
- `component`, `inputRef`, nested `config`, `autoReset`, and legacy
  `onKeyPress` are not part of the `1.0.0` API. Explain migration paths in the
  documentation, especially the ref-based replacement for `autoSelect`.

## Documentation and release

Keep technical documentation and code-facing contracts in English. Document
controlled/uncontrolled usage, exact digit scaling, callback payloads, limits,
format options, refs, accessibility, SSR, framework fixtures, and every
removed legacy prop. Documentation examples are acceptance criteria.

Set final package metadata to `1.0.0`. SemVer prereleases use identifiers such
as `1.0.0-alpha.1`, `1.0.0-beta.1`, and `1.0.0-rc.1`.

Normal edits, pushes, pull requests, and merges do not trigger promotion. Only
a published GitHub Release triggers CD. Release tags must match `package.json`
exactly and must be bare stable SemVer tags such as `1.0.0`; prerelease tags
are rejected before side effects. Agents must not create or push tags without
explicit authorization. Before modifying release tooling, inspect and follow
the release workflow and preserve its least-privilege, protected-environment,
artifact-promotion, and evidence requirements. Promotion retries may reference
only an existing published GitHub Release; they must not create, move, or
recreate a tag or promote an unpublished, draft, or prerelease release.

Unrelated findings belong in follow-up notes unless they block an acceptance
criterion, compromise correctness or safety, or invalidate the release
workflow.

## Completion evidence

A task is complete only when its required tests and builds have run from the
current changes, their output has been inspected, and the result is reported
with the exact commands and any remaining limitations.
