import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup-tests.ts"],
    coverage: {
      include: ["app/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "vite-env.d.ts", "**/*.d.ts"],
    },
    globals: true,
  },
});
