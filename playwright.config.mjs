import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:4176', browserName: 'chromium' },
  webServer: {
    command: 'npm start',
    env: { PORT: '4176' },
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: !process.env.CI
  }
});
