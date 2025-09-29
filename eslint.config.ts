import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      quotes: ["error", "double"],
      "prefer-template": ["error"],
    },
  },
]);
