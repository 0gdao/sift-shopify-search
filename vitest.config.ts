import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      include: ["lib/**/*.ts"],
      exclude: ["lib/catalog/mock.ts", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
    },
  },
});
