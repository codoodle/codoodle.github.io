import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

import eslintJs from "@eslint/js";
import eslintNext from "@next/eslint-plugin-next";
import eslintJsxA11y from "eslint-plugin-jsx-a11y";
import eslintReact from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslintTs from "typescript-eslint";

const config = defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      js: eslintJs,
      ts: eslintTs.plugin,
    },
    extends: [
      eslintJs.configs.recommended,
      eslintTs.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["apps/www/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [
      eslintReact.configs.flat.recommended,
      eslintReact.configs.flat["jsx-runtime"],
      eslintReactHooks.configs["recommended-latest"],
      eslintJsxA11y.flatConfigs.recommended,
      eslintNext.flatConfig.coreWebVitals,
    ],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  globalIgnores([
    "**/.next/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/out/**",
    "**/coverage/**",
  ]),
]);

export default config;
