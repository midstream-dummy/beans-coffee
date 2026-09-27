import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // `reuseExistingServer` is what makes this config work in both places:
  // in CI Playwright starts the app itself, and in a Midstream deploy the
  // app is already running from `midstream.json`'s start command.
  webServer: {
    command: "npm start",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
  },
});
