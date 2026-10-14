import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
  exports?: Record<string, unknown>;
  files?: string[];
  main?: string;
  module?: string;
  types?: string;
};

describe('published package boundary', () => {
  it('declares dual-format entry points and public metadata', () => {
    expect(packageJson.main).toBe('./dist/lib/index.cjs');
    expect(packageJson.module).toBe('./dist/lib/index.js');
    expect(packageJson.types).toBe('./dist/lib/index.d.ts');
    expect(packageJson.exports).toEqual({
      '.': {
        types: './dist/lib/index.d.ts',
        import: './dist/lib/index.js',
        require: './dist/lib/index.cjs',
      },
    });
  });

  it('declares the expected packed artifact boundary', () => {
    execFileSync('npm', ['run', 'build:lib'], {
      cwd: packageRoot,
      stdio: 'inherit',
    });
    const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    const parsed = JSON.parse(output) as unknown;
    const findFiles = (value: unknown): Array<{ path: string }> | undefined => {
      if (!value || typeof value !== 'object') return undefined;
      if ('files' in value && Array.isArray(value.files)) return value.files as Array<{ path: string }>;
      if (Array.isArray(value)) {
        for (const entry of value) {
          const files = findFiles(entry);
          if (files) return files;
        }
      } else {
        for (const entry of Object.values(value)) {
          const files = findFiles(entry);
          if (files) return files;
        }
      }
      return undefined;
    };
    const files = findFiles(parsed);
    if (!files) throw new Error('npm pack did not return a file manifest');
    const paths = files.map(({ path }) => path).sort();

    expect(paths).toEqual([
      'LICENSE',
      'README.md',
      'dist/lib/index.cjs',
      'dist/lib/index.d.cts',
      'dist/lib/index.d.ts',
      'dist/lib/index.js',
      'package.json',
    ]);
    expect(packageJson.files).toEqual(['dist/lib']);
  }, 30_000);

  it('runs the installed-package integration verifier only when explicitly enabled', {
    skip:
      process.env.PACKAGE_INTEGRATION === '1' ? false : 'set PACKAGE_INTEGRATION=1 to run temporary matrix installs',
  }, () => {
    execFileSync(process.execPath, [join(packageRoot, 'scripts/verify-package.mjs')], {
      cwd: packageRoot,
      stdio: 'inherit',
      env: process.env,
    });
  });
});
