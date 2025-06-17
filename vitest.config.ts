/** @format */

import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["tests/**/*.test.ts"],
        exclude: ["tests/e2e/**", "node_modules/**"],
        environment: "node",
        globals: true,
        threads: true,
        retry: process.env.CI ? 2 : 0,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json"],
        },
    },
