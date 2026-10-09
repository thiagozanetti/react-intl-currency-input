import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const packageName = packageJson.name;
const expectedFiles = [
  'LICENSE',
  'README.md',
  'dist/lib/index.cjs',
  'dist/lib/index.d.ts',
  'dist/lib/index.js',
  'package.json',
];
const reactMatrix = [
  {
    name: 'react18',
    react: '18.3.1',
    reactDom: '18.3.1',
    typesReact: '18.3.26',
    typesReactDom: '18.3.7',
  },
  {
    name: 'react19',
    react: '19.2.0',
    reactDom: '19.2.0',
    typesReact: '19.1.8',
    typesReactDom: '19.1.6',
  },
];

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createConsumer(verification, matrix) {
  const consumerRoot = mkdtempSync(join(verification.root, `${matrix.name}-consumer-`));
  cpSync(verification.tarball, join(consumerRoot, verification.tarballName));

  writeJson(join(consumerRoot, 'package.json'), {
    name: `currency-input-${matrix.name}-consumer`,
    private: true,
    type: 'module',
    dependencies: {
      [packageName]: `file:./${verification.tarballName}`,
      jsdom: '26.1.0',
      react: matrix.react,
      'react-dom': matrix.reactDom,
    },
    devDependencies: {
      '@types/node': '24.13.3',
      '@types/react': matrix.typesReact,
      '@types/react-dom': matrix.typesReactDom,
      typescript: '5.9.3',
    },
  });

  writeFileSync(join(consumerRoot, 'consumer.mjs'), `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
import React, { createElement, createRef } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import esm, { CurrencyInput, formatCurrency, normalizeCurrencyValue } from '${packageName}';

const require = createRequire(import.meta.url);
const cjs = require('${packageName}');
for (const loaded of [esm, cjs]) {
  assert.equal(typeof loaded.default, 'object');
  assert.equal(typeof loaded.CurrencyInput, 'object');
  assert.equal(typeof loaded.formatCurrency, 'function');
  assert.equal(typeof loaded.normalizeCurrencyValue, 'function');
}
assert.equal(formatCurrency(1, 'en-US', 'USD'), '$1.00');
assert.equal(typeof normalizeCurrencyValue(1, { maximumFractionDigits: 2 }), 'number');
assert.doesNotThrow(() => renderToString(createElement(CurrencyInput, { currency: 'USD', defaultValue: 1 })));

const dom = new JSDOM('<!doctype html><div id="root"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
const container = document.getElementById('root');
const root = createRoot(container);
const ref = createRef();
await act(async () => root.render(createElement(CurrencyInput, { ref, currency: 'USD', defaultValue: 2 })));
assert.ok(ref.current instanceof dom.window.HTMLInputElement);
const firstInput = ref.current;
await act(async () => root.render(createElement(CurrencyInput, { ref, currency: 'USD', defaultValue: 3 })));
assert.equal(ref.current, firstInput);
assert.equal(ref.current.value, '$2.00');
root.unmount();
console.log('${matrix.name} consumer runtime, SSR, ESM/CJS, and ref checks passed');
`);

  writeFileSync(join(consumerRoot, 'consumer.tsx'), `import type { CurrencyInputProps, LocaleTag, NormalizeCurrencyValueOptions } from '${packageName}';
import CurrencyInput, { formatCurrency, normalizeCurrencyValue } from '${packageName}';
import type { ComponentProps } from 'react';

const locale: LocaleTag = 'en-US';
const options: NormalizeCurrencyValueOptions = { maximumFractionDigits: 2 };
const props: CurrencyInputProps = { currency: 'USD', value: normalizeCurrencyValue(1, options) };
const inputProps: ComponentProps<typeof CurrencyInput> = props;
void inputProps;
void formatCurrency(1, locale, 'USD');
`);

  writeJson(join(consumerRoot, 'tsconfig.json'), {
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    files: ['consumer.tsx'],
  });
  return consumerRoot;
}

function createFixture(verification, fixtureName, matrix) {
  const fixtureRoot = mkdtempSync(join(verification.root, `${fixtureName}-${matrix.name}-`));
  cpSync(join(root, 'fixtures', fixtureName), fixtureRoot, { recursive: true });
  const packagePath = join(fixtureRoot, 'package.json');
  const fixturePackage = JSON.parse(readFileSync(packagePath, 'utf8'));
  fixturePackage.dependencies = {
    ...fixturePackage.dependencies,
    [packageName]: `file:./${verification.tarballName}`,
    react: matrix.react,
    'react-dom': matrix.reactDom,
  };
  fixturePackage.devDependencies = {
    ...fixturePackage.devDependencies,
    '@types/node': '24.13.3',
    '@types/react': matrix.typesReact,
    '@types/react-dom': matrix.typesReactDom,
    jsdom: '26.1.0',
    typescript: '5.9.3',
  };
  writeJson(packagePath, fixturePackage);
  cpSync(verification.tarball, join(fixtureRoot, verification.tarballName));
  return fixtureRoot;
}

function writeFixtureSmoke(consumerRoot, fixtureName, matrix) {
  writeFileSync(join(consumerRoot, 'fixture-smoke.mjs'), `import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { createElement, createRef } from 'react';
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import CurrencyInput, { formatCurrency } from '${packageName}';

assert.equal(formatCurrency(1, 'en-US', 'USD'), '$1.00');
assert.match(renderToString(createElement(CurrencyInput, {
  currency: 'USD',
  defaultValue: 1,
  'aria-label': '${fixtureName} SSR amount',
})), /input/);

const ssrMarkup = renderToString(createElement(CurrencyInput, {
  currency: 'USD',
  defaultValue: 2,
  'aria-label': '${fixtureName} hydration amount',
}));
const dom = new JSDOM('<!doctype html><div id="root">' + ssrMarkup + '</div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
const container = document.getElementById('root');
const root = hydrateRoot(container, createElement(CurrencyInput, {
  currency: 'USD',
  defaultValue: 2,
  'aria-label': '${fixtureName} hydration amount',
}));
await act(async () => {});
const ref = createRef();
await act(async () => root.render(createElement(CurrencyInput, {
  ref,
  currency: 'USD',
  defaultValue: 2,
  'aria-label': '${fixtureName} client amount',
})));
assert.ok(container.querySelector('input') instanceof dom.window.HTMLInputElement);
assert.ok(ref.current instanceof dom.window.HTMLInputElement);
assert.equal(ref.current.value, '$2.00');
root.unmount();
console.log('${fixtureName} ${matrix.name} installed-package SSR/client/ref smoke passed');
`);
}

const verificationRoot = mkdtempSync(join(tmpdir(), 'react-intl-currency-input-verify-'));
const verification = { root: verificationRoot, tarball: '', tarballName: '' };

try {
  assert(packageJson.version === '1.0.0', 'package version must be 1.0.0');
  assert(packageJson.peerDependencies.react === '>=18.2.0 <20', 'React peer range is incorrect');
  assert(packageJson.peerDependencies['react-dom'] === '>=18.2.0 <20', 'React DOM peer range is incorrect');
  run('npm', ['run', 'build:lib'], root);

  const [packManifest] = JSON.parse(execFileSync(
    'npm', ['pack', '--json', '--pack-destination', verificationRoot],
    { cwd: root, encoding: 'utf8' },
  ));
  verification.tarballName = packManifest.filename;
  verification.tarball = join(verificationRoot, packManifest.filename);
  assert(existsSync(verification.tarball), 'npm pack did not create a tarball');

  const archivePaths = execFileSync('tar', ['-tzf', verification.tarball], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((path) => path.replace(/^package\//, ''))
    .filter(Boolean)
    .sort();
  assert(JSON.stringify(archivePaths) === JSON.stringify(expectedFiles), `unexpected package files:\n${archivePaths.join('\n')}`);

  for (const matrix of reactMatrix) {
    const consumerRoot = createConsumer(verification, matrix);
    run('npm', ['install', '--no-package-lock', '--ignore-scripts'], consumerRoot);
    run('node', ['consumer.mjs'], consumerRoot);
    run(join(consumerRoot, 'node_modules', '.bin', 'tsc'), ['--project', 'tsconfig.json'], consumerRoot);

    for (const fixtureName of ['vite', 'next', 'remix']) {
      const fixtureRoot = createFixture(verification, fixtureName, matrix);
      run('npm', ['install', '--no-package-lock', '--ignore-scripts'], fixtureRoot);
      run('npm', ['run', 'build'], fixtureRoot);
      run(join(fixtureRoot, 'node_modules', '.bin', 'tsc'), ['--noEmit', '--project', 'tsconfig.json'], fixtureRoot);
      writeFixtureSmoke(fixtureRoot, fixtureName, matrix);
      run('node', ['fixture-smoke.mjs'], fixtureRoot);
    }
  }

  console.log(`Package boundary verified from ${verification.tarballName}: archive, installed ESM/CJS, declarations, SSR, refs, React 18/19, and Vite/Next/Remix builds.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
