import globals from "globals";
import jslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  jslint.configs.recommended,
  ...tseslint.configs.recommended,
  // General
  {
    files: ["packages/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  },
  // CLI
  {
    files: ["packages/cli/**/*.ts"],
    rules: {
    }
  }
];