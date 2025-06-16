/** @format */

import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["tests/**/*.test.ts"],
        environment: "node",
        globals: true,
        exclude: ["tests/e2e/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json"],
        },
    },
})
