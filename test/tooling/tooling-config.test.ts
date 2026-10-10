import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import packageJson from '../../package.json';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('modern tooling configuration', () => {
  it('declares the Node 24 engine and distinct verification scripts', () => {
    expect(packageJson.engines?.node).toMatch(/24/);
    expect(packageJson.scripts).toEqual(
      expect.objectContaining({
        typecheck: expect.any(String),
        lint: expect.any(String),
        'test:unit': expect.any(String),
        'test:e2e': expect.any(String),
        'build:lib': expect.any(String),
        'build:app': expect.any(String),
        'build:all': expect.any(String),
      }),
    );
  });

  it('configures Vitest with jsdom and the shared setup file', () => {
    const config = readFileSync(resolve(root, 'vitest.config.ts'), 'utf8');

    expect(config).toContain("environment: 'jsdom'");
    expect(config).toContain('app/test.setup.ts');
  });

  it('configures all required Playwright browser projects', () => {
    const config = readFileSync(resolve(root, 'playwright.config.ts'), 'utf8');

    expect(config).toMatch(/name:\s*['"]chromium['"]/);
    expect(config).toMatch(/name:\s*['"]firefox['"]/);
    expect(config).toMatch(/name:\s*['"]webkit['"]/);
  });

  it('keeps the release workflow and lint toolchain modern and substantive', () => {
    const workflow = readFileSync(
      resolve(root, '.github/workflows/release.yml'),
      'utf8',
    );
    const eslintConfig = readFileSync(resolve(root, '.eslintrc.cjs'), 'utf8');

    expect(workflow).toContain('actions/download-artifact@v4');
    expect(eslintConfig).toContain('root: true');
    expect(eslintConfig).toContain("'eslint:recommended'");
    expect(eslintConfig).toContain("'plugin:@typescript-eslint/recommended'");
    expect(eslintConfig).toContain("'plugin:react/recommended'");
    expect(packageJson.devDependencies).toEqual(
      expect.objectContaining({
        '@typescript-eslint/eslint-plugin': expect.stringMatching(/^\^?8\./),
        '@typescript-eslint/parser': expect.stringMatching(/^\^?8\./),
        eslint: expect.stringMatching(/^\^?9\./),
        typescript: expect.stringMatching(/^\^?5\.9\./),
        vite: expect.stringMatching(/^\^?7\./),
        vitest: expect.stringMatching(/^\^?4\./),
        '@vitejs/plugin-react': expect.stringMatching(/^\^?5\./),
        tsup: expect.stringMatching(/^\^?8\./),
      }),
    );
  });
});
