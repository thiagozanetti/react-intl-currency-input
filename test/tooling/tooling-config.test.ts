import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

  it('uses native numeric handling without a big.js dependency', () => {
    const formatter = readFileSync(resolve(root, 'lib/format-currency.ts'), 'utf8');

    expect(packageJson.dependencies ?? {}).not.toHaveProperty('big.js');
    expect(packageJson.devDependencies).not.toHaveProperty('@types/big.js');
    expect(formatter).not.toContain("from 'big.js'");
  });

  it('uses native code rendering without a syntax-highlighter dependency', () => {
    const app = readFileSync(resolve(root, 'app/App.tsx'), 'utf8');

    expect(packageJson.devDependencies).not.toHaveProperty('react-syntax-highlighter');
    expect(packageJson.devDependencies).not.toHaveProperty('@types/react-syntax-highlighter');
    expect(app).not.toContain('react-syntax-highlighter');
    expect(app).toMatch(/<pre>\s*<code>/);
  });

  it('keeps the React test platform on the current supported major', () => {
    expect(packageJson.devDependencies).toEqual(
      expect.objectContaining({
        '@testing-library/react': expect.stringMatching(/^\^?16\./),
        '@types/react': expect.stringMatching(/^\^?19\./),
        '@types/react-dom': expect.stringMatching(/^\^?19\./),
        react: expect.stringMatching(/^\^?19\./),
        'react-dom': expect.stringMatching(/^\^?19\./),
      }),
    );
  });

  it('keeps jsdom on the current supported browser-emulation major', () => {
    expect(packageJson.devDependencies.jsdom).toMatch(/^\^?30\./);
  });

  it('keeps Vite and the React plugin on their compatible supported majors', () => {
    expect(packageJson.devDependencies).toEqual(
      expect.objectContaining({
        '@vitejs/plugin-react': expect.stringMatching(/^\^?6\./),
        vite: expect.stringMatching(/^\^?8\./),
      }),
    );
  });

  it('keeps TypeScript on the current supported compatible major', () => {
    expect(packageJson.devDependencies.typescript).toMatch(/^\^?5\.9\./);
  });

  it('uses the planned modern library bundler', () => {
    expect(packageJson.scripts['build:lib']).toContain('tsdown');
    expect(packageJson.devDependencies.tsdown).toMatch(/^\^?0\.23\./);
  });

  it('uses a portable cleanup script for generated application output', () => {
    expect(packageJson.scripts['build:app']).toContain('scripts/clean.mjs');
    expect(packageJson.scripts['build:app']).not.toContain('rm -rf');
    expect(readFileSync(resolve(root, 'scripts/clean.mjs'), 'utf8')).toContain("from 'node:fs/promises'");
  });

  it('keeps Vitest and coverage tooling on their compatible supported majors', () => {
    expect(packageJson.devDependencies).toEqual(
      expect.objectContaining({
        '@vitest/coverage-v8': expect.stringMatching(/^\^?5\./),
        vitest: expect.stringMatching(/^\^?5\./),
      }),
    );
  });

  it('keeps the release workflow and lint toolchain modern and substantive', () => {
    const workflow = readFileSync(resolve(root, '.github/workflows/release.yml'), 'utf8');
    const biomeConfig = readFileSync(resolve(root, 'biome.json'), 'utf8');

    expect(workflow).toContain('actions/download-artifact@v4');
    expect(packageJson.scripts.lint).toContain('biome check');
    expect(biomeConfig).toContain('"organizeImports"');
    expect(biomeConfig).toContain('"recommended": true');
    expect(packageJson.devDependencies).toEqual(
      expect.objectContaining({
        '@biomejs/biome': expect.stringMatching(/^\^?2\./),
        typescript: expect.stringMatching(/^\^?5\.9\./),
        vite: expect.stringMatching(/^\^?8\./),
        vitest: expect.stringMatching(/^\^?5\./),
        '@vitejs/plugin-react': expect.stringMatching(/^\^?6\./),
        tsdown: expect.stringMatching(/^\^?0\.23\./),
      }),
    );
    expect(packageJson.devDependencies).not.toHaveProperty('eslint');
    expect(packageJson.devDependencies).not.toHaveProperty('@typescript-eslint/eslint-plugin');
    expect(packageJson.devDependencies).not.toHaveProperty('@typescript-eslint/parser');
    expect(packageJson.devDependencies).not.toHaveProperty('eslint-plugin-react');
  });
});
