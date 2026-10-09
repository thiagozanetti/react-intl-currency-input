import { existsSync } from 'node:fs';

if (!existsSync(new URL('../README.md', import.meta.url))) {
  console.error('README.md is required.');
  process.exit(1);
}

console.log('README.md is present; documentation contract checks are deferred to the documentation task.');
