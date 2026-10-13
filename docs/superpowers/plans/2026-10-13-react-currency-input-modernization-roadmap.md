# React Currency Input Modernization Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this roadmap task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the `1.0.0` package maintainable and future-proof while protecting its exact currency behavior, browser compatibility, package boundary, and release controls.

**Architecture:** Preserve the native `BigInt`/minor-unit arithmetic model and the typed `CurrencyInput` contract. Modernize tooling and dependencies in isolated, reversible batches. Every batch must prove that the packed package, framework fixtures, browser interactions, and release workflow still satisfy the approved design.

**Tech Stack:** Node 24, Biome 2.5.15, TypeScript, Vite, Vitest, React Testing Library, Playwright, tsup, npm, and Vite/Next.js/Remix consumer fixtures.

**Spec:** [`docs/superpowers/specs/2026-10-08-react-currency-input-modernization-design.md`](../specs/2026-10-08-react-currency-input-modernization-design.md)

## Status legend

- `[x]` Completed and validated in the current worktree.
- `[ ]` Planned work.
- `[!]` Blocked by an environment or external prerequisite.

## Global constraints

- Keep public values as major-unit JavaScript numbers and internal arithmetic exact.
- Preserve dynamic `maximumFractionDigits` scaling; never reintroduce a hardcoded two-digit assumption.
- Treat controlled/uncontrolled state, callback ordering, limits, caret behavior, accessibility, SSR, and React 18/19 compatibility as behavior gates.
- Use Node 24+ and the repository lockfile.
- Run cheap static, type, documentation, build, package, and fixture checks before expensive unit and browser suites.
- Change one modernization concern at a time when behavior or dependency resolution may be affected.
- Only a published GitHub Release authorizes CD. Agents must not create, move, recreate, or push tags without explicit authorization.
- Release tags must be bare stable SemVer and exactly match `package.json`; prereleases must be rejected before promotion side effects.
- Keep technical documentation and code-facing contracts in English.

## Review focus

- Exact minor-unit arithmetic and formatting at zero, one, two, and three fraction digits.
- Controlled `value={0}`, uncontrolled `defaultValue`, min/max rejection, callback ordering, sign toggling, paste sanitization, and caret-at-end behavior.
- Chromium, Firefox, and WebKit interaction, accessibility, and visual coverage.
- ESM, CJS, declarations, SSR, React 18, React 19, Vite, Next.js, and Remix package resolution.
- Dependency or formatter changes that might silently alter runtime behavior, generated output, test semantics, or release artifacts.

## Roadmap sequence

### Phase 0 — Establish the baseline and release boundary

- [x] Read and follow the approved modernization design.
- [x] Work in an isolated worktree on Node 24 with the lockfile.
- [x] Establish the validation order: cheap checks first, expensive tests last.
- [ ] Commit the current modernization batch only after its full evidence is reviewed.
- [ ] Push the branch and wait for CI before any release action.
- [ ] Do not create or recreate a tag as part of branch integration.

**Exit criteria:** The branch is pushed, CI is green, and no release or tag action has occurred.

### Phase 1 — Remove avoidable runtime dependencies

- [x] Replace `big.js` usage with the existing exact native `BigInt`/minor-unit implementation.
- [x] Remove `big.js` and its type package from runtime and development metadata.
- [x] Replace `react-syntax-highlighter` in the example surface with native `<pre><code>` markup.
- [x] Confirm the root audit is clean and the package has no unnecessary runtime dependencies.

**Behavior gate:** Currency arithmetic, formatting, examples, package contents, and fixtures remain unchanged except for the intended dependency simplification.

**Exit criteria:** `npm audit --audit-level=high`, `npm run build:all`, `npm run pack:check`, and `npm run verify:package` pass.

### Phase 2 — Adopt Biome as the source of truth for lint and formatting

- [x] Add pinned `biome.json` configuration for the application, library, tests, scripts, and config files.
- [x] Preserve the existing formatting style and organize imports.
- [x] Remove ESLint, TypeScript ESLint, ESLint configuration, and ignore files.
- [x] Avoid unsafe semantic fixes for React dependencies, ARIA structure, explicit test types, and non-null assertions.
- [x] Reconcile formatter output with tests without changing product behavior.
- [ ] Consider a separate `format:check` script if CI needs clearer formatting-only diagnostics.

**Behavior gate:** Biome is limited to style/import organization unless a later change is separately reviewed as a semantic refactor.

**Exit criteria:** `npm run lint`, `npm run typecheck`, `npm run verify:docs`, and `git diff --check` pass.

### Phase 3 — Modernize the dependency stack in isolated batches

For each batch: update one related group, run the cheap checks, inspect the diff, then run unit and browser tests only after all other checks pass.

#### 3.1 React and test platform

- [ ] Evaluate the current supported React 19, React DOM, React type, Testing Library, and user-event majors.
- [ ] Keep the React 18 fixture and peer compatibility checks while adding or retaining React 19 coverage.
- [ ] Evaluate the Testing Library 16 migration for changed queries, event semantics, and accessibility assertions.
- [ ] Update jsdom separately from Testing Library if its browser-emulation behavior changes.

**Exit criteria:** Component, accessibility, SSR, React 18/19, and fixture checks pass with no callback or DOM contract regressions.

#### 3.2 Build, type, and test tools

- [ ] Evaluate the current supported Vite and `@vitejs/plugin-react` majors as one compatibility group.
- [ ] Evaluate Vitest and coverage-provider majors together, preserving the current coverage thresholds and test ordering.
- [ ] Evaluate TypeScript only after the Vite/Vitest toolchain is stable; treat compiler diagnostics as a separate review.
- [ ] Record any incompatibility as a follow-up rather than combining unrelated source changes.

**Exit criteria:** Typecheck, library/example builds, unit tests, coverage, packed-package checks, and fixtures pass.

#### 3.3 Browser automation

- [ ] Evaluate the current supported Playwright major independently.
- [ ] Install and verify Chromium, Firefox, and WebKit binaries before relying on local browser results.
- [ ] Re-run interaction, accessibility, and visual suites after the upgrade.

**Exit criteria:** All three browser projects pass locally or the exact host limitation is documented while CI supplies authoritative WebKit evidence.

### Phase 4 — Simplify build and maintenance tooling

- [ ] Compare tsup with Vite library mode and `tsdown` against the existing ESM/CJS/declaration/SSR contract.
- [ ] Switch bundlers only if the packed tarball, exports map, declarations, tree-shaking, SSR imports, and fixtures remain equivalent.
- [ ] Replace shell-specific `rm -rf` package scripts with a portable Node cleanup script where practical.
- [ ] Keep generated artifacts out of the repository and verify clean worktrees after validation.
- [ ] Revisit Biome rule exceptions one at a time; enable stronger rules only with behavior-focused tests.

**Exit criteria:** The package artifact is equivalent or demonstrably improved, and the toolchain works on supported developer and CI environments.

### Phase 5 — CI, audit, and release hardening

- [ ] Keep pull requests and `main` validation on Node 24 with least-privilege permissions and concurrency cancellation.
- [ ] Keep Dependency Review and audit reporting separate from the root package audit result.
- [ ] Ensure the release workflow triggers only on `release: published`.
- [ ] Validate the published release tag against `package.json` and reject prereleases before npm or Vercel side effects.
- [ ] Build once and promote immutable npm/Vercel artifacts through the protected `Production` environment.
- [ ] Preserve OIDC/Trusted Publishing, protected Vercel secrets, retry idempotency, failure issue tracking, and release evidence containing checksums, commit SHA, artifact IDs, and deployment URLs.
- [ ] Treat promotion retries as actions on an existing published release only; never create or move tags during retry.

**Exit criteria:** Workflow configuration checks pass, CI is green on the pushed commit, and release evidence requirements are testable before authorizing `1.0.0` publication.

### Phase 6 — Release readiness and maintenance loop

- [ ] Confirm `package.json` remains `1.0.0`, the changelog has the release notes, and README content is user-facing.
- [ ] Keep operational restrictions and agent instructions in `AGENTS.md`, not README or changelog history.
- [ ] Run the complete evidence sequence below from the final release commit.
- [ ] Obtain explicit authorization before publishing the GitHub Release or triggering promotion.
- [ ] After release, record package version, release URL, commit SHA, checksums, npm provenance, deployment URLs, and workflow run IDs.
- [ ] Revisit this roadmap when a dependency major, browser engine, React peer, or release-control requirement changes.

## Required validation sequence

Run these in order; do not spend the machine's limited resources on tests until the earlier checks pass:

```sh
fnm use 24
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm run verify:docs
npm run build:all
npm run pack:check
npm run verify:package
npm run verify:fixtures
npm run test:unit -- --run
npm run coverage
npm run test:e2e
git diff --check
```

Fixture install audits may report vulnerabilities inherited from the Next.js or Remix fixture dependency trees. Track those separately from the root package audit and do not claim the root audit is clean unless its result is independently verified.

## Current checkpoint

- The native dependency cleanup and Biome migration are implemented in the current worktree.
- Root audit, lint, typecheck, documentation checks, builds, package checks, fixtures, unit tests, and coverage have passed.
- Chromium and Firefox browser suites passed.
- WebKit is currently blocked locally by missing host libraries (`libicudata.so.70`, `libicui18n.so.70`, `libicuuc.so.70`, and `libavif.so.13`); CI remains authoritative for that project until the host is repaired.
- The current worktree is still uncommitted and unpushed; CI and release status must be revalidated after committing and pushing.

## Completion evidence

- [ ] Exact command output is inspected and recorded for every required check.
- [ ] The final diff is reviewed for behavior changes, generated files, and dependency lockfile correctness.
- [ ] CI passes on the pushed commit.
- [ ] No tag was created, moved, recreated, or pushed by the agent.
- [ ] A published GitHub Release exists before any npm or Vercel promotion is attempted.
