import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import googleConfig from "eslint-config-google";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: require("eslint-plugin-prettier"),
    },
    extends: [
      googleConfig,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    rules: {
      "prettier/prettier": "error", // Ensures Prettier formatting is enforced
    },
  },
];
