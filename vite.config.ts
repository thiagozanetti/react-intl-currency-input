/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import packageJson from './package.json';

const buildCommit = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local';
const buildTimestamp = new Date().toISOString();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_COMMIT__: JSON.stringify(buildCommit),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  plugins: [react()],
});
