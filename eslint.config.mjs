import tseslint from "typescript-eslint";

const noServiceImports = {
  group: ["@/data/services/*", "**/data/services/*"],
  message: "Services cannot import other services.",
};

const noRepositoryImports = {
  group: ["@/data/repositories/*", "**/data/repositories/*"],
  message: "Repositories cannot import other repositories.",
};

const noSourceInfrastructure = [
  {
    group: ["@/db/*", "@/lib/supabase/*"],
    message: "Only repositories may import data-source infrastructure.",
  },
  {
    group: ["@supabase/*", "drizzle-orm", "drizzle-orm/*", "postgres"],
    message: "Only repositories may import data-source SDKs.",
  },
];

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "drizzle/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["src/data/services/**/*.service.ts"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "no-restricted-imports": [
        "error",
        { patterns: [noServiceImports, ...noSourceInfrastructure] },
      ],
    },
  },
  {
    files: ["src/data/contexts/**/*.context.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [noServiceImports, ...noSourceInfrastructure] },
      ],
    },
  },
  {
    files: ["src/data/repositories/**/*.repository.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [noServiceImports, noRepositoryImports] },
      ],
    },
  },
);
