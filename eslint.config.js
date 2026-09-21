import eslint from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "*.min.js",
    ],
  },

  eslint.configs.recommended,

  // Node.js code: BFF and mock API
  {
    files: [
      "bff/**/*.js",
      "mock-api/**/*.js",
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        fetch: "readonly",
      },
    },

    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "camelcase": "error",
      "eqeqeq": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  // Browser code: frontend, Alpine.js, and Bootstrap
  {
    files: [
      "src/**/*.js",
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        Alpine: "readonly",
        bootstrap: "readonly",
      },
    },

    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "camelcase": "error",
      "eqeqeq": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  // Test code: Node.js, browser, and Playwright
  {
    files: [
      "tests/**/*.js",
      "tests/**/*.mjs",
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
        fetch: "readonly",
      },
    },

    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "camelcase": "error",
      "eqeqeq": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];