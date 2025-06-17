/** @format */

import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"


export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "node",
        globals: true,
        include: ["tests/**/*.test.ts"],
        exclude: ["tests/e2e/**", "node_modules/**"],
    },
    plugins: [tsconfigPaths()],
})
