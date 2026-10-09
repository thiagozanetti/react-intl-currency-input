import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/test.setup.ts',
    css: false,
    include: ['app/**/*.test.tsx', 'test/**/*.test.ts', 'test/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['app/**', 'test/**', '**/*.d.ts'],
    },
  },
});
