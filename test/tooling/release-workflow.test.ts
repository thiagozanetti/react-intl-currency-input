import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function read(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('release automation contract', () => {
  it('runs required verification on pull requests and main with least privilege', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).toContain('pull_request:');
    expect(workflow).toMatch(/push:\s*\n\s*branches:\s*\[\s*main\s*\]/);
    expect(workflow).toContain('cancel-in-progress: true');
    expect(workflow).toContain('permissions: {}');
    expect(workflow).toContain('actions/dependency-review-action@v4');
    expect(workflow).toContain('npm audit');
    for (const command of [
      'npm run typecheck',
      'npm run lint',
      'npm run test:unit -- --run',
      'npm run coverage',
      'npm run verify:docs',
      'npm run build:all',
      'npm run verify:fixtures',
      'npm run test:e2e',
    ]) {
      expect(workflow).toContain(command);
    }
    for (const project of ['chromium', 'firefox', 'webkit']) {
      expect(workflow).toContain(`--project=${project}`);
    }
  });

  it('only promotes a published bare stable release from one immutable build', () => {
    const workflow = read('.github/workflows/release.yml');

    expect(workflow).toContain('types: [published]');
    expect(workflow).not.toContain('workflow_dispatch');
    expect(workflow).toContain('scripts/validate-release.mjs');
    expect(workflow).toContain('github.event.release.tag_name');
    expect(workflow).toContain('npm publish');
    expect(workflow).toContain('--provenance');
    expect(workflow).toContain('environment: Production');
    expect(workflow).toContain('id-token: write');
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('actions/download-artifact@v4');
    expect(workflow).toContain('vercel@latest pull --yes --environment=production');
    expect(workflow).toContain('vercel@latest build --prod');
    expect(workflow).toContain('--cwd app');
    expect(workflow).toContain('gh issue list --repo "$REPOSITORY"');
    expect(workflow).toContain('gh issue comment "$issue" --repo "$REPOSITORY"');
    expect(workflow).toContain('gh issue create --repo "$REPOSITORY"');
    expect(workflow).toMatch(/vercel(?:@latest)? deploy --prebuilt/);
    expect(workflow).toContain('GITHUB_STEP_SUMMARY');
    expect(workflow).toContain('github.sha');
    expect(workflow).toContain('sha256sum');
    expect(workflow).toContain('gh issue');
    expect(workflow).toContain('if: always()');
  });

  it('keeps internal release safeguards in agent guidance, not the README', () => {
    const agents = read('AGENTS.md');
    const readme = read('README.md');

    expect(agents).toMatch(/only\s+a\s+published GitHub Release triggers CD/i);
    expect(agents).toContain('must not create or push tags');
    expect(agents).toMatch(/release tags must match `package\.json`/i);
    expect(readme).not.toMatch(/does not publish to npm|create an external release|push a tag/i);
  });
});
