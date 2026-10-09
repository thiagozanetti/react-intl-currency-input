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
});
