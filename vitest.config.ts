/** @format */

import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["tests/**/*.test.ts"],
        exclude: ["tests/e2e/**", "node_modules/**"],
        environment: "node",
        globals: true,
        retry: process.env.CI ? 2 : 0,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json"],
        },
    },
})
