export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["tests/**/*.test.ts", "**/__tests__/**/*.test.ts"],
        exclude: ["tests/e2e/**", "node_modules/**"],
        environment: "node",
        globals: true,
        retry: process.env.CI ? 2 : 0,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json"],
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80,
            all: true,
        },
    },
});