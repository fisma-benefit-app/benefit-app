import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts, which throws when VITE_API_URL is not set; the unit tests don't
// need the app's env or plugins.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
