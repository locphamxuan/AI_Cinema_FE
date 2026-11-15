import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setupTests.ts'],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // The form tests type into every field; a loaded CI runner needs more than the 5 s default.
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/tests/**', 'src/**/*.d.ts', 'src/app/**/layout.tsx'],
    },
  },
});
