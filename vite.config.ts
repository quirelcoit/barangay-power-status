import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        sw: "src/worker/service-worker.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "sw"
            ? "service-worker.js"
            : "[name]-[hash].js";
        },
      },
    },
  },
});
