import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const tag = process.argv[2];
const expectedCommit = process.argv[3];
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

if (!tag || !expectedCommit) throw new Error('Usage: validate-release.mjs <tag> <commit>');
if (!/^\d+\.\d+\.\d+$/.test(tag)) {
  throw new Error(`Release tag must be a bare stable SemVer version, received ${tag}`);
}
if (tag !== packageJson.version) {
  throw new Error(`Release tag ${tag} does not match package.json version ${packageJson.version}`);
}

const tagCommit = execFileSync('git', ['rev-list', '-n1', `refs/tags/${tag}^{commit}`], { encoding: 'utf8' }).trim();
if (tagCommit !== expectedCommit) {
  throw new Error(`Release tag ${tag} resolves to ${tagCommit}, not workflow commit ${expectedCommit}`);
}

console.log(`Validated stable release ${tag} at ${expectedCommit}`);
