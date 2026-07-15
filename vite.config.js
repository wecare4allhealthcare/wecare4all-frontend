import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    strictPort: false,  // allow next port if 5173 is busy
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  // No PostCSS/Tailwind — project uses pure inline CSS + CSS variables
});
