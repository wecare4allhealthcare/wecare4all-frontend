import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Separate config for the test runner (vite.config.js stays untouched
// for the actual app build). Vitest reads this automatically.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
