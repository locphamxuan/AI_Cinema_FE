import { defineConfig, devices } from '@playwright/test';
import { APP_PORT, FAKE_API_PORT, FAKE_API_URL } from './e2e/env';

/**
 * End-to-end tests: a production build of the back office against the fake AI Cinema API in `e2e/fake-api`,
 * so no backend is needed. The fake keeps state, hence one worker and a reset before each test.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node e2e/fake-api/server.mjs',
      url: `${FAKE_API_URL}/__health`,
      reuseExistingServer: !process.env.CI,
      env: { FAKE_API_PORT: String(FAKE_API_PORT) },
    },
    {
      // The /api rewrite is fixed at build time, so the build already points at the fake API.
      command: `npm run build && npx next start --port ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: { BACKEND_URL: `http://localhost:${FAKE_API_PORT}` },
    },
  ],
});
