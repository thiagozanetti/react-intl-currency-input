import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: 'lib/index.tsx',
  deps: { neverBundle: ['react', 'react-dom'] },
  format: ['es', 'cjs'],
  hash: false,
  outDir: 'dist/lib',
  outExtensions: ({ format }) => ({
    dts: format === 'es' ? '.d.ts' : '.d.cts',
    js: format === 'es' ? '.js' : '.cjs',
  }),
  outputOptions: { exports: 'named' },
});
