import { existsSync } from 'node:fs';

const fixtureRoot = new URL('../fixtures/', import.meta.url);

if (!existsSync(fixtureRoot)) {
  console.log('No consumer fixtures are present yet; fixture verification is deferred to the package-boundary task.');
  process.exit(0);
}

console.log('Consumer fixture directory found; detailed fixture checks are owned by the package-boundary task.');
