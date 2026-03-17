import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 120_000,
  reporter: 'list',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1200 },
    trace: 'on-first-retry',
    colorScheme: 'light',
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      maxDiffPixelRatio: 0.001,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        nuxt: {
          rootDir: fileURLToPath(new URL('.', import.meta.url)),
        },
      },
    },
  ],
})
