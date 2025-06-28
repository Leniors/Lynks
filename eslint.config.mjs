// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginNext from "@next/eslint-plugin-next";
import { FlatCompat } from "@eslint/eslintrc"; // Needed for compatibility with older configs like 'eslint-config-next'
import path from "path";
import { fileURLToPath } from "url";

// Polyfill for __dirname in ES Modules (Node.js < 20.11.0)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  // If you want to use the default recommended ESLint JS config directly:
  // recommendedConfig: pluginJs.configs.recommended,
});

export default [
  // 1. Ignore files/directories
  {
    ignores: [
      ".next/**",
      "node_modules/",
      "public/",
      "out/",
      "next.config.js", // or next.config.mjs if you chose that
      "postcss.config.js",
      "tailwind.config.ts", // or .js
      "*.d.ts", // Ignore all declaration files
    ],
  },

  // 2. Base configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], // Apply to all JS/TS/JSX/TSX files
    languageOptions: {
      globals: {
        ...globals.browser, // Browser globals (e.g., window, document)
        ...globals.node,    // Node.js globals (e.g., process, Buffer)
      },
      parserOptions: {
        ecmaVersion: "latest", // Use the latest ECMAScript version
        sourceType: "module",  // Enable ES modules
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
      next: {
        rootDir: true, // Auto-detect Next.js root
      },
    },
  },

  // 3. Recommended ESLint rules for JavaScript
  pluginJs.configs.recommended,

  // 4. Recommended ESLint rules for TypeScript
  // This includes rules from @typescript-eslint/eslint-plugin
  ...tseslint.configs.recommended,

  // 5. Recommended ESLint rules for React (hooks specific)
  pluginReact.configs.flat.recommended,

  // 6. Next.js specific rules
  // Use FlatCompat to extend from eslint-config-next
  ...compat.config({
    extends: [
      "next/core-web-vitals", // Essential Next.js rules, including Core Web Vitals
      "next/typescript",      // Next.js TypeScript specific rules
      // "prettier" // If you're using prettier, this should usually be the last extend to disable conflicting rules
    ],
  }),

  // 7. Custom rules or overrides
  {
    rules: {
      // General ESLint rules
      "no-unused-vars": "warn", // Warn about unused variables
      "no-console": ["warn", { allow: ["warn", "error"] }], // Allow warn/error, but warn on console.log
      // TypeScript ESLint rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }, // Ignore unused vars starting with _
      ],
      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ and Next.js automatic JSX runtime
      "react/prop-types": "off", // Not needed if you're using TypeScript for prop-typing
      // Next.js specific rule examples (adjust as needed)
      "@next/next/no-img-element": "warn", // Warn about <img> tags, prefer next/image
      // "some-other-rule": "error",
    },
  },

  // If you integrate with Prettier, typically eslint-config-prettier would be the last one
  // {
  //   extends: [
  //     eslintConfigPrettier, // Disables ESLint rules that conflict with Prettier
  //   ],
  // },
];