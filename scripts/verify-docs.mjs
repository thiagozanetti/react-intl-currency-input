import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];

function requireText(path, terms) {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) {
    failures.push(`missing file: ${path}`);
    return;
  }
  const content = readFileSync(fullPath, 'utf8');
  for (const term of terms) {
    const found = typeof term === 'string' ? content.includes(term) : term.test(content);
    if (!found) failures.push(`${path} is missing ${term}`);
  }
}

requireText('README.md', [
  '# react-intl-currency-input',
  '## Numeric and editing rules',
  '## Controlled and uncontrolled usage',
  '## Locale, currency, formatting, and limits',
  '## Refs, focus, and auto-select',
  '## Accessibility',
  '## SSR and framework usage',
  'React 18', 'CommonJS', 'major currency units', 'exact decimal strings',
  'maximumFractionDigits', 'Backspace and Delete', 'Negative zero',
  'onChange` first, then `onValueChange`', 'Rejected edits', 'value={0}',
  'autoFocus', 'aria-invalid', 'Vite, Next.js, and Remix',
  /\| `0` \| `12345` \| `12345` \|/,
  /\| `1` \| `12345` \| `1234\.5` \|/,
  /\| `2` \| `12345` \| `123\.45` \|/,
  /\| `3` \| `12345` \| `12\.345` \|/,
]);

requireText('docs/migration-0.3.x.md', [
  '# Migrating from 0.3.x to 1.0.0',
  '`component`', '`inputRef`', '`config`', '`autoReset`', '`autoSelect`', '`onKeyPress`',
  'onChange', 'onFocus', 'onBlur', 'onValueChange', 'formatOptions', 'ref={inputRef}',
  'maximumFractionDigits',
]);

requireText('CHANGELOG.md', [
  '# Changelog', '## [Unreleased]', '## [1.0.0] - 2026-10-09',
  '### Added', '### Changed', '### Removed',
  '1.0.0-alpha.1', '1.0.0-beta.1', '1.0.0-rc.1',
]);

if (failures.length > 0) {
  console.error(`Documentation contract failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Documentation contract passed: README, migration guide, and changelog contain the required 1.0 API guidance.');
