import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
