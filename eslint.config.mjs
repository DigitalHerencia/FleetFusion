import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const databasePackages = [
  "@prisma/client",
  "@prisma/adapter-neon",
  "@neondatabase/serverless",
];

const databaseImportPatterns = [
  "@/generated/prisma/**",
  "**/generated/prisma/**",
  "@/lib/db/**",
  "**/lib/db/**",
];

const rawSqlSyntax = [
  "TaggedTemplateExpression[tag.name='sql']",
  "TaggedTemplateExpression[tag.type='MemberExpression'][tag.property.name='$queryRaw']",
  "TaggedTemplateExpression[tag.type='MemberExpression'][tag.property.name='$executeRaw']",
  "CallExpression[callee.type='MemberExpression'][callee.property.name='$queryRawUnsafe']",
  "CallExpression[callee.type='MemberExpression'][callee.property.name='$executeRawUnsafe']",
  "TaggedTemplateExpression[tag.type='MemberExpression'][tag.object.name='Prisma'][tag.property.name='sql']",
];

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}"],
    rules: {
      "no-debugger": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["app/**/*.{js,jsx,ts,tsx}", "proxy.{js,ts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: databasePackages.map((name) => ({
            name,
            allowTypeImports: true,
            message: "Database runtime access belongs in lib/db.",
          })),
          patterns: [
            {
              group: databaseImportPatterns,
              message:
                "Routes and proxy must use fetchers, actions, auth, or workflows instead of database implementation.",
            },
          ],
        },
      ],
    },
  },
  // Actions may use the canonical DTO, select, tenant, and transaction helpers.
  // Provider semantics remain isolated behind integration adapters.
  {
    files: ["lib/actions/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/integrations/**", "**/lib/integrations/**"],
              message:
                "Server Actions invoke provider behavior through workflows or provider-neutral capabilities.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["features/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: databasePackages.map((name) => ({
            name,
            allowTypeImports: true,
            message: "Features use fetchers and actions, never database SDKs.",
          })),
          patterns: [
            {
              group: [
                ...databaseImportPatterns,
                "@/app/**",
                "**/app/**",
                "@/lib/integrations/**",
                "**/lib/integrations/**",
              ],
              message:
                "Features orchestrate templates and workflows without importing routes, providers, or database implementation.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: databasePackages.map((name) => ({
            name,
            allowTypeImports: true,
            message: "Presentation cannot import database SDKs.",
          })),
          patterns: [
            {
              group: [
                ...databaseImportPatterns,
                "@/lib/actions/**",
                "**/lib/actions/**",
                "@/lib/fetchers/**",
                "**/lib/fetchers/**",
                "@/lib/integrations/**",
                "**/lib/integrations/**",
                "@/lib/workflows/**",
                "**/lib/workflows/**",
                "@/lib/auth/**",
                "**/lib/auth/**",
                "@/lib/authz/**",
                "**/lib/authz/**",
                "@/features/**",
                "**/features/**",
                "@/app/**",
                "**/app/**",
              ],
              message:
                "Presentation components cannot own server, provider, workflow, database, or route behavior.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}"],
    ignores: ["lib/db/**", "prisma/**", "tests/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...rawSqlSyntax.map((selector) => ({
          selector,
          message: "Raw SQL is restricted to lib/db/** or prisma/**.",
        })),
      ],
    },
  },
  {
    files: ["components/blocks/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...rawSqlSyntax.map((selector) => ({
          selector,
          message: "Raw SQL is restricted to lib/db/** or prisma/**.",
        })),
        {
          selector: "ImportDeclaration[source.value='react-hook-form']",
          message:
            "React Hook Form state belongs in form features, not blocks.",
        },
      ],
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".cache/**",
    ".artifacts/**",
    ".clerk/**",
    ".vercel/**",
    ".stripe/**",
    ".neon/**",
    ".supabase/**",
    ".wrangler/**",
    "next-env.d.ts",
    "generated/prisma/**",
    "node_modules/**",
    "public/**",
  ]),
]);
