/** @format */

import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "node",
        globals: true,
        include: ["tests/**/*.test.ts"],
        threads: true,
        retry: process.env.CI ? 2 : 0,
    },
})
