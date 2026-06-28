import { defineConfig, devices } from "@playwright/test";

// When BASE_URL is set (e.g. the Docker container), test against it and skip
// starting the dev server. Otherwise default to the local dev server.
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const external = !!process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  // All tests share one backend user/board, so run serially against it.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: external
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
