import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: "src/card.ts",
      formats: ["es"],
      fileName: () => "bvg-connections-card.js",
    },
    outDir: "../custom_components/bvg_connections/frontend",
    emptyOutDir: false,
    target: "es2022",
    minify: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
  },
});
