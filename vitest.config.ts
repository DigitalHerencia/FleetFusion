/** @format */

import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        include: [
            "tests/**/*.test.ts",
            "tests/**/*.test.tsx",
            "**/__tests__/**/*.test.ts",
            "**/__tests__/**/*.test.tsx",
        ],
        exclude: ["tests/e2e/**", "tests/**/*.spec.ts", "node_modules/**"],
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        retry: process.env.CI ? 2 : 0,
        testTimeout: 30000,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json"],
            all: true,
            exclude: [
                "node_modules/**",
                "tests/**",
                "**/*.d.ts",
                "**/*.config.*",
                "**/dist/**",
                "coverage/**",
                ".next/**",
            ],
        },
        // Add module name mapping for better compatibility
        alias: {
            "@": new URL("./", import.meta.url).pathname,
        },
    },
    resolve: {
        alias: {
            "@": new URL("./", import.meta.url).pathname,
        },
    },
})