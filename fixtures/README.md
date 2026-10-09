# Consumer fixtures

These small applications consume a generated package tarball. They intentionally
do not use a workspace dependency or a source import.

`PACKAGE_INTEGRATION=1 npm run test:unit -- --run test/package/package-boundary.test.ts`
or `node scripts/verify-package.mjs` builds the library, creates a real
temporary tarball, stages it into generated consumer projects, installs it by
package name, builds every fixture, runs strict TypeScript checks, and executes
generated SSR/client/ref smoke programs against the installed package. Temporary
projects and tarballs are removed at the end of verification. Ordinary unit
runs do not perform these matrix installs.

The fixtures cover:

- Vite client rendering and a forwarded input ref;
- Next.js server rendering plus a client component;
- Remix server rendering plus a client route.

The verifier runs a pinned React 18 and React 19 matrix, with matching pinned
React declaration versions. Fixture manifests keep their framework dependencies
only; the verifier injects the generated tarball, matrix React versions, and
typecheck dependencies, so no generated lockfiles or archives are committed.
