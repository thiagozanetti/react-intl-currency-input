import { rm } from 'node:fs/promises';

const targets = process.argv.slice(2);

if (targets.length === 0) {
  throw new Error('Provide at least one generated artifact path to remove.');
}

await Promise.all(targets.map((target) => rm(target, { force: true, recursive: true })));
