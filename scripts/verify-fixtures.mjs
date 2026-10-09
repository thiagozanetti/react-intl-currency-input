import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Keep fixture verification coupled to the tarball verifier. A no-op check
// could hide stale manifests or source imports that bypass the package boundary.
execFileSync(process.execPath, [join(root, 'scripts', 'verify-package.mjs')], {
  cwd: root,
  stdio: 'inherit',
});
