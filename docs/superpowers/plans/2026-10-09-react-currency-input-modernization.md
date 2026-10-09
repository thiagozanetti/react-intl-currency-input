# React Currency Input Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Characterize the legacy currency input, implement the approved exact and typed `1.0.0` API, modernize its toolchain/package, and verify it through component, browser, framework, and release-artifact tests.

**Architecture:** Keep pure normalization and formatting in focused utility modules, with the component owning input state, digit-stream editing, limits, callbacks, and ref behavior. Preserve the default package export while adding named exports, and build one package that exposes conditional ESM/CJS entry points and declarations. Characterize the current API in a separate legacy test surface before replacing it with the new component contract.

**Tech Stack:** React 18/19, TypeScript strict mode, Vite, Vitest, React Testing Library, Playwright, Node 24+, tsup or equivalent dual-format bundler, npm workspaces, and minimal Vite/Next.js/Remix consumer fixtures.

**Spec:** `docs/superpowers/specs/2026-10-08-react-currency-input-modernization-design.md`

## Global Constraints

- Public currency values are major-unit JavaScript numbers; internal arithmetic uses exact minor-unit/decimal handling.
- Digit entry is a minor-unit stream scaled by effective `maximumFractionDigits`, never a hardcoded two digits.
- Only digits and the negative sign are semantic input; formatting occurs on every edit.
- The caret stays at the end; Backspace and Delete remove the rightmost digit; `-` toggles the sign.
- `value` is authoritative in controlled mode, including zero; `defaultValue` initializes uncontrolled mode.
- Accepted edits invoke native `onChange` before `onValueChange`; rejected min/max edits invoke neither callback.
- Locale, currency, and formatting changes reformat without emitting a value change.
- The canonical component is `CurrencyInput` with a forwarded input ref; retain the default export and add named exports.
- React and React DOM are peer-compatible with React 18 and 19.
- ESM, CJS, declarations, SSR-safe imports, and Vite/Next.js/Remix resolution are release requirements.
- Use Node 24+ and current compatible tooling; CI must not use the obsolete Node 16/18 matrix.
- Final package metadata is `1.0.0`; prereleases use SemVer identifiers such as `1.0.0-alpha.1`, `1.0.0-beta.1`, and `1.0.0-rc.1`.
- Do not publish to npm, create an external release, or push a tag.
- Technical documentation and code-facing contracts are English.
- Non-blocking unrelated findings become follow-up notes; blockers affecting correctness, safety, or acceptance criteria must be resolved or reported.

## Review Focus

- Minor-unit digit scaling with `maximumFractionDigits` of 0, 1, 2, and 3, including minimum-only formatting options; tested in utility and component tasks.
- Sanitized paste and sign toggling with currency symbols, grouping, decimal separators, repeated signs, empty input, and only-minus input; tested in characterization and component tasks.
- Controlled `value={0}`, controlled parent lag, controlled out-of-range values, and uncontrolled `defaultValue`; tested in component task.
- Caret-at-end behavior across keyboard, mouse/touch placement, Backspace/Delete, selection, rapid rerenders, and narrow viewports; tested in component and browser tasks.
- Package boundary behavior from a packed tarball under ESM, CJS, SSR, React 18, React 19, Vite, Next.js, and Remix; tested in package/fixture task.

## File map

- `lib/currency-decimal.ts`: exact decimal/minor-unit representation and arithmetic helpers.
- `lib/normalize-currency-value.ts`: public normalization API and digit-stream parsing.
- `lib/format-currency.ts`: typed Intl formatting API.
- `lib/types.ts`: public component and utility types.
- `lib/CurrencyInput.tsx`: modern component implementation.
- `lib/index.tsx`: default and named package exports (rename to `lib/index.ts` only if the build requires it, and update every entrypoint together).
- `test/legacy/`: characterization tests for the existing API and historical behavior.
- `test/unit/`: pure utility tests.
- `test/component/`: React Testing Library tests for the new API.
- `test/browser/`: Playwright journeys and accessibility/visual assertions.
- `fixtures/`: Vite, Next.js, and Remix consumer smoke projects.
- `docs/migration-0.3.x.md`: migration guide.
- `CHANGELOG.md`: Keep a Changelog release notes.
- `.github/workflows/`: Node 24 CI, browser, package, and release-preparation workflows.

## Execution setup checkpoint

Before Task 1, create or verify an isolated worktree, install the current
lockfile with Node 24+, and run the unmodified baseline. Do not begin source
implementation on `main`. If a required dependency or browser binary is
missing, resolve that environment issue before recording characterization
results; an unverified environment is not an accepted baseline.

### Task 1: Establish the clean baseline and legacy characterization

**Files:**
- Create: `test/legacy/legacy-currency-input.test.tsx`
- Create: `test/legacy/legacy-format-currency.test.ts`
- Create: `test/legacy/legacy-configuration.test.tsx`
- Create: `test/legacy/browser/legacy-currency-input.spec.ts`
- Create: `test/legacy/browser/legacy-accessibility.spec.ts`
- Create: `test/legacy/browser/legacy-visual.spec.ts`
- Create: `playwright.legacy.config.ts`
- Create: `.node-version` if the existing version file is absent or stale
- Modify: `vite.config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: current default export from `lib/index.tsx`, current `IntlCurrencyInputProps`, and existing legacy config shape.
- Produces: executable tests that pin current behavior and a documented baseline command for later tasks.

- [ ] **Step 1: Record the current environment and run the unmodified baseline**

  Run `node --version && npm --version && npm test -- --run && npm run lint && npm run build:all`.

  Expected: the output records every baseline failure without changing source; if the repository does not install or build cleanly, record the exact failure as a baseline blocker and continue characterization with the smallest setup-only fix.

- [ ] **Step 2: Write passing characterization tests for initialization and numeric behavior**

  Add tests for the current `defaultValue`, `value`, omitted values, integer-as-minor-unit behavior, decimals, embedded zeroes, negative values, negative zero, zero callbacks, locale/currency changes, custom fraction digits, maximum boundaries, and malformed configuration. Assert both callback arguments and rendered input value.

- [ ] **Step 3: Run the characterization tests and verify they record current behavior**

  Run `npm test -- --run test/legacy/legacy-currency-input.test.tsx test/legacy/legacy-format-currency.test.ts test/legacy/legacy-configuration.test.tsx`.

  Expected: tests pass against the unchanged implementation and each observed behavior is recorded in an explicit test name/assertion. Environment failures must be fixed before proceeding; they are not accepted as characterization results.

- [ ] **Step 4: Add interaction characterization coverage**

  Cover focus, auto-focus, auto-select, blur, auto-reset, forwarded refs, custom input components, key-up/legacy `onKeyPress`, native event values, selection, paste sanitization, rapid prop updates, and narrow rendered layout. Keep legacy tests separate from new-contract tests.

- [ ] **Step 5: Add the characterization-only browser harness**

  Add the Playwright test runner and a temporary legacy configuration without changing the production API or final browser-test contract. Pin deterministic locale/timezone settings and a preview/start command for the unchanged example.

- [ ] **Step 6: Add and run the pre-redesign browser characterization suite**

  Run the unchanged example/application in Chromium, Firefox, and WebKit. Assert exact displayed strings, canonical callback payloads, callback counts/order, `selectionStart`/`selectionEnd`, keyboard/paste/delete behavior, focus transitions, accessibility name/focus/invalid evidence, and screenshots at deterministic desktop and narrow viewports for zero, positive, negative, locale, maximum rejection, and focus/selection states.

  Run `npx playwright test --config=playwright.legacy.config.ts --project=chromium --project=firefox --project=webkit`.

  Expected: all legacy browser, accessibility, and visual assertions pass against the unchanged implementation; retain report artifacts as the baseline.

- [ ] **Step 7: Run the complete baseline suite and commit the characterization checkpoint**

  Run `npm test -- --run` and `npm run lint`.

  Expected: all characterization tests and browser baselines pass; no new API implementation is present.

  Commit with `git add test playwright.legacy.config.ts vite.config.ts package.json .node-version && git commit -m "test: characterize legacy currency input"`.

### Task 1.5: Fix historical regressions under the legacy API

**Files:**
- Modify: `lib/IntlCurrencyInput.tsx`
- Modify: `lib/format-currency.ts`
- Modify: `lib/types.ts`
- Modify: `test/legacy/`

**Interfaces:**
- Consumes: Task 1 characterization evidence and historical fixes from git history.
- Produces: a green, still-legacy API whose known defects have explicit regression tests before the redesign.

- [ ] **Step 1: Convert historical bug cases into failing regression tests**

  Pin decimals and integer/cents normalization, embedded zeroes, negative zero, zero callbacks, max boundaries, currency changes, auto-focus/auto-select, auto-reset, callback arguments, malformed configuration, and distribution regressions identified from git history.

- [ ] **Step 2: Run each regression test and observe the historical failure**

  Run `npm test -- --run test/legacy` and the affected legacy Playwright projects.

  Expected: every newly added regression fails for the historical defect it names; unrelated characterization tests remain green.

- [ ] **Step 3: Implement the smallest legacy-compatible fixes**

  Correct only the defects covered by the regression tests, preserving the existing prop names, callback signatures, config shape, and rendered interaction model.

- [ ] **Step 4: Re-run the full legacy suite and commit the regression checkpoint**

  Run `npm test -- --run test/legacy`, `npm run typecheck`, and the legacy three-browser command.

  Expected: all characterization and historical regression tests pass before any breaking API work begins.

  Commit with `git add lib test/legacy && git commit -m "fix: close legacy currency input regressions"`.

### Task 2: Modernize dependencies, test infrastructure, and CI

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Modify: `tsconfig.node.json`
- Modify: `vite.config.ts`
- Create: `vitest.config.ts` if configuration is split
- Create: `playwright.config.ts`
- Create: `test/tooling/tooling-config.test.ts`
- Create: `app/test.setup.ts` or move setup to the test root as needed
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/publish-lib.yml`
- Modify: `.github/workflows/publish-app.yml`
- Create: `.github/workflows/e2e.yml` if browser execution is separate

**Interfaces:**
- Consumes: Task 1 characterization and Task 1.5 regression checkpoints.
- Produces: Node 24-compatible install, strict typecheck, Vitest, Playwright browser projects, and CI commands consumed by all later tasks.

- [ ] **Step 1: Add tooling tests/configuration expectations before dependency edits**

  Add a package/tooling smoke test that asserts the configured Vitest environment, Playwright project names (`chromium`, `firefox`, `webkit`), and Node engine constraints are discoverable from the repository configuration.

- [ ] **Step 2: Run the smoke test and verify it fails against the old toolchain**

  Run `npm test -- --run test/tooling/tooling-config.test.ts`.

  Expected: FAIL because the new configuration and scripts do not yet exist.

- [ ] **Step 3: Upgrade the toolchain and scripts**

  Move to Node 24+, current compatible TypeScript/Vite/Vitest/Testing Library/ESLint/build dependencies, retain the Playwright characterization harness, move React and React DOM to peer dependencies, retain only true runtime dependencies, and add separate real `typecheck` and `lint` scripts plus `test:unit`, `test:e2e`, `build:lib`, `build:app`, `build:all`, `pack:check`, fixture verification, and documentation verification. Preserve a clean `npm ci` path.

- [ ] **Step 4: Configure strict tests and browser projects**

  Configure jsdom setup, coverage-compatible Vitest execution, Playwright device/browser projects, deterministic locale/timezone where needed, and browser artifact output.

- [ ] **Step 5: Update CI actions and Node matrix**

  Replace obsolete action versions and Node 16/18 matrices with Node 24+, run clean install, typecheck, unit/component tests, builds, fixture checks, and Playwright installation/execution.

- [ ] **Step 6: Verify the modernized infrastructure and commit**

  Run `npm ci`, `npm run typecheck`, `npm run test:unit -- --run test/tooling/tooling-config.test.ts`, and `npm run build:all`.

  Expected: clean install and tooling checks pass; product behavior remains governed by the passing legacy characterization/regression checkpoints.

  Commit with `git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts playwright.config.ts .github app/test.setup.ts && git commit -m "build: modernize node and test tooling"`.

### Task 3: Implement exact decimal utilities and public types

**Files:**
- Create: `lib/currency-decimal.ts`
- Create: `lib/normalize-currency-value.ts`
- Modify: `lib/format-currency.ts`
- Modify: `lib/types.ts`
- Create: `test/unit/currency-decimal.test.ts`
- Create: `test/unit/normalize-currency-value.test.ts`
- Create: `test/unit/format-currency.test.ts`

**Interfaces:**
- Consumes: exact fraction-digit and sanitization rules from the spec.
- Produces: resolved-format-options helpers, `normalizeCurrencyValue(value: string | number, options?: { maximumFractionDigits?: number }): number`, `formatCurrency(value: number, locale: string, currency: string, options?: Intl.NumberFormatOptions): string`, internal exact minor-unit helpers, and `CurrencyInputProps`.

- [ ] **Step 1: Write failing exact arithmetic tests**

  Cover conversion to/from minor units, rounding ties and positive/negative boundaries, values that round across min/max, negative zero, `NaN`, infinities, unsafe integers, scientific notation, large decimal strings, and values with 0/1/2/3 maximum fraction digits.

- [ ] **Step 2: Run the utility tests and verify the expected missing-helper failures**

  Run `npm run test:unit -- --run test/unit/currency-decimal.test.ts`.

  Expected: FAIL because the exact helper module does not exist.

- [ ] **Step 3: Implement exact internal decimal/minor-unit helpers**

  Implement integer minor-unit storage and decimal-string conversion without repeated binary floating-point arithmetic. Use the effective maximum fraction digits as the scale and normalize negative zero to zero.

- [ ] **Step 4: Write failing normalization and formatting tests**

  Assert that only digits and one toggling negative sign are semantic, that `12345` maps to `123.45` at scale 2 and `12.345` at scale 3, that separators/currency symbols are stripped, and that `formatCurrency` injects the required currency while preserving other Intl options. Add explicit minimum-only, zero-decimal currency, invalid locale/currency, invalid fraction combination, and conflicting-currency cases.

- [ ] **Step 5: Implement resolved format options, public utilities, and types**

  Resolve effective `Intl.NumberFormat` options first, including inferred maximum fraction digits for minimum-only options and currency defaults. Implement the exact public signatures, typed locale/options handling, and `CurrencyInputProps` with native input attributes and owned props omitted. Keep exact string/minor-unit values internal and convert to public `number` only at the documented boundary. Run `npm run test:unit -- --run test/unit` and `npm run typecheck`.

  Expected: all utility tests pass and TypeScript reports no errors.

- [ ] **Step 6: Commit the exact utility boundary**

  Commit with `git add lib test/unit && git commit -m "feat: add exact currency normalization utilities"`.

### Task 4: Implement the native `CurrencyInput` component

**Files:**
- Create: `lib/CurrencyInput.tsx`
- Modify: `lib/index.tsx`
- Remove or replace: `lib/IntlCurrencyInput.tsx`
- Modify: `lib/types.ts`
- Create: `test/component/currency-input.test.tsx`
- Create: `test/component/currency-input.accessibility.test.tsx`
- Modify: `app/App.tsx`
- Modify: `app/App.test.tsx`

**Interfaces:**
- Consumes: Task 3 exact helpers, resolved format options, `normalizeCurrencyValue`, `formatCurrency`, and `CurrencyInputProps`.
- Produces: default and named `CurrencyInput`, forwarded `HTMLInputElement` ref, controlled/uncontrolled behavior, native events, `onValueChange`, formatting, limits, accessibility state, and end-anchored editing.

- [ ] **Step 1: Write failing component tests for the approved public API**

  Add tests for required `currency`, default formatting, controlled `value` including zero, uncontrolled `defaultValue`, `defaultValue` updates, controlled/uncontrolled transitions, controlled parent lag, `onValueChange(value, formattedValue)`, native event payloads/order, `preventDefault()` behavior, forwarded refs, native attributes, locale/currency/format changes, and default `inputMode`/text input behavior.

- [ ] **Step 2: Run the component tests and verify they fail against the legacy API**

  Run `npm run test:unit -- --run test/component/currency-input.test.tsx`.

  Expected: FAIL because the legacy component does not expose the modern props or ref contract.

- [ ] **Step 3: Add failing tests for digit editing and limits**

  Cover scale 0/1/2/3 with explicit canonical/display assertions, minimum-only padding, empty input, only-minus input, repeated/misplaced signs, sign toggle, negative zero, exact paste matrices, Backspace/Delete after selection, Arrow/Home/End and mouse caret placement, direct selection ranges, min/max acceptance/rejection including rounding across boundaries, controlled out-of-range warning/invalid state, malformed options, repeated-zero callback suppression, formatting-only callback suppression, and callback suppression for rejected edits.

- [ ] **Step 4: Implement the component state and event model**

  Implement `forwardRef<HTMLInputElement>`, exact canonical state, controlled/uncontrolled synchronization, formatted display on every edit, end-anchored selection, sign toggle, min/max validation, native callback ordering, and development invalid-state warning. Keep locale/currency/format-only changes callback-free.

- [ ] **Step 5: Add accessibility and visual component assertions**

  Test labels/accessible name, `aria-invalid`, associated descriptions, focus ring/visible focus, disabled/read-only/required behavior, native attribute forwarding, rendered currency output for positive/negative/zero values, custom fraction digits, narrow container behavior, and auto-focus. Add the documented ref-based auto-select example to the app and test it.

- [ ] **Step 6: Run the complete unit/component suite and update the example**

  Run `npm run test:unit -- --run` and `npm run typecheck`.

  Expected: all legacy tests remain available as historical evidence, all new component tests pass, and the example uses only the 1.0 API.

- [ ] **Step 7: Commit the component redesign**

  Commit with `git add lib app test/component && git commit -m "feat: replace legacy input with native currency input"`.

### Task 5: Build package exports and consumer compatibility

**Files:**
- Modify: `package.json`
- Modify: `lib/index.tsx`
- Modify: build configuration used by `build:lib`
- Create: `test/package/package-boundary.test.ts`
- Create: `fixtures/vite/`
- Create: `fixtures/next/`
- Create: `fixtures/remix/`
- Create: `fixtures/README.md`
- Create: `scripts/verify-package.mjs`

**Interfaces:**
- Consumes: Task 4 package exports and public types.
- Produces: packed package with conditional ESM/CJS/declarations and fixtures that consume the tarball with React 18 and 19-compatible APIs.

- [ ] **Step 1: Write failing package-boundary tests**

  Test that `npm pack --json` contains only intended artifacts, that ESM import and CJS require resolve the component/utilities/types metadata, and that a forwarded ref reaches an input in a consumer.

- [ ] **Step 2: Run package tests and verify the old metadata fails**

  Run `npm run pack:check`.

  Expected: FAIL because the current package metadata, tarball contents, and export map do not meet the 1.0 contract.

- [ ] **Step 3: Implement dual-format package exports**

  Configure `exports`, `main`, `module`, `types`, files/ignore rules, declaration output, and default/named exports. Set package version to `1.0.0`, React peer ranges to `>=18.2.0 <20`, and keep the packed artifact free of source/app/test/fixture/CI files.

- [ ] **Step 4: Add consumer fixtures**

  Add minimal Vite client, Next.js SSR/client, and Remix SSR/client fixtures that install the generated `.tgz` tarball (never a workspace link), import the package through supported entry points, render the input, exercise a ref, compile declaration imports, run `renderToString`/hydration checks, and avoid `window`/`document` access during SSR. Verify each fixture under separate latest React 18 and React 19 dependency jobs.

- [ ] **Step 5: Verify package and fixtures**

  Run `npm run build:lib`, `npm run pack:check`, `npm run verify:fixtures`, and `npm run typecheck`.

  Expected: ESM/CJS imports, declarations, SSR-safe imports, React 18/19 peer resolution, and all three fixtures pass.

- [ ] **Step 6: Commit package compatibility**

  Commit with `git add package.json package-lock.json lib/index.tsx scripts fixtures && git commit -m "build: verify dual-format package exports"`.

### Task 6: Add Playwright journeys and CI acceptance coverage

**Files:**
- Create: `test/browser/currency-input.spec.ts`
- Create: `test/browser/accessibility.spec.ts`
- Create: `test/browser/visual.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `.github/workflows/ci.yml`
- Create or modify: `.github/workflows/e2e.yml`

**Interfaces:**
- Consumes: Task 4 app/example selectors and the finalized Playwright projects from Task 2.
- Produces: cross-engine browser evidence for all interaction and visual acceptance criteria.

- [ ] **Step 1: Write browser journeys before implementation changes**

  Add journeys for scale-aware digit entry, sign toggling, Backspace/Delete, paste sanitization, Arrow/Home/End and mouse caret placement, focus transitions, auto-focus, ref-based auto-select, locale/currency changes, rejected limits, controlled parent lag, `preventDefault()`, rapid updates, and narrow viewport layout. Add accessibility snapshots/assertions for accessible name, descriptions, keyboard operation, focus visibility, invalid state, disabled/read-only behavior, and native attributes.

- [ ] **Step 2: Run the browser suite and verify missing journey/implementation failures**

  Run `npx playwright test --project=chromium --project=firefox --project=webkit`.

  Expected: failures identify missing selectors, browser config, or behavior; classify each as infrastructure versus component behavior before fixing.

- [ ] **Step 3: Stabilize selectors and browser behavior**

  Use accessible names and stable test IDs only where semantic selectors cannot express the assertion. Fix cross-engine caret, paste, focus, and viewport issues in production code or tests according to the spec.

  Configure an explicit `webServer`/preview lifecycle, deterministic locale/timezone/fonts, fixed desktop and narrow viewport sizes, screenshot baselines, and an agreed pixel-diff threshold. Retain failed screenshots, traces, and accessibility snapshots.

- [ ] **Step 4: Verify all browser projects and uploadable artifacts**

  Run the full Playwright command and inspect reports/screenshots/traces for failures.

  Expected: Chromium, Firefox, and WebKit pass with no unexplained visual/accessibility failures.

- [ ] **Step 5: Commit browser acceptance coverage**

  Commit with `git add test/browser playwright.config.ts .github/workflows && git commit -m "test: cover currency input browser journeys"`.

### Task 7: Documentation, changelog, release metadata, and final verification

**Files:**
- Modify: `README.md`
- Create: `docs/migration-0.3.x.md`
- Create: `CHANGELOG.md`
- Modify: `package.json`
- Modify: `app/App.tsx`
- Create: `test/docs/documentation-contract.test.ts`
- Modify: `AGENTS.md` only when a discovery changes a repository-wide acceptance rule; otherwise record it as a follow-up note

**Interfaces:**
- Consumes: finalized public API, package exports, fixtures, and browser evidence from Tasks 3–6.
- Produces: complete user migration path and verified `1.0.0` release candidate without external publication.

- [ ] **Step 1: Write documentation tests/checks**

  Add a documentation/fixture check that required headings and code examples exist for controlled/uncontrolled usage, callbacks, digit scaling, custom fraction digits, refs/auto-select replacement, limits, accessibility, SSR, Vite, Next.js, Remix, and every removed prop. Compile the examples through TypeScript or execute them in the consumer fixtures.

- [ ] **Step 2: Run documentation checks and verify missing-contract failures**

  Run `npm run verify:docs`.

  Expected: FAIL until the new README, migration guide, and changelog are present and complete.

- [ ] **Step 3: Rewrite README and add migration guide**

  Document the public API, exact digit model, dynamic maximum-fraction scaling, native events, callback payloads, controlled/uncontrolled semantics, limits, refs, accessibility, SSR, framework fixtures, and explicit legacy mappings with before/after examples.

- [ ] **Step 4: Add Keep a Changelog release notes**

  Add a `1.0.0` entry with breaking changes, removed props, callback migration, exact numeric behavior, tooling/package changes, and prerelease SemVer guidance. Do not perform npm/GitHub/tag release operations.

- [ ] **Step 5: Run the complete release verification**

  Run `npm ci && npm run typecheck && npm run lint && npm run test:unit -- --run && npm run test:e2e && npm run build:all && npm run verify:fixtures && npm run pack:check && npm run verify:docs`.

  Expected: every command exits 0; inspect the packed tarball listing, ESM/CJS smoke output, browser report, and fixture output before claiming completion.

- [ ] **Step 6: Perform final diff/spec review and commit**

  Re-read the approved spec and this plan, run `git diff --check`, inspect `git status`, and verify no legacy API remains in public types or exports except documented characterization fixtures. Confirm release workflows are prepared but not dispatched. Commit with `git add README.md docs/migration-0.3.x.md CHANGELOG.md package.json app/App.tsx && git commit -m "release: prepare currency input 1.0.0"`.

## Final review checklist

- [ ] All task commits exist in order and each task's focused test command passed.
- [ ] Legacy characterization remains separate from 1.0 behavior tests.
- [ ] Every spec acceptance item maps to a passing test, build, fixture, or inspected artifact.
- [ ] `npm pack` contains only intended release files.
- [ ] No publish, external release, or pushed tag was performed.
- [ ] Remaining non-blocking findings are recorded for follow-up.
