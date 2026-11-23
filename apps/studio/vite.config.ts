import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : process.env.GITHUB_PAGES_BASE ?? "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@storycharts/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
  },
}));
