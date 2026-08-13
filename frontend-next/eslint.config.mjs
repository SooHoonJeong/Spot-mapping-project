import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // ported from frontend/eslint.config.js: allow unused vars/consts whose name is
      // ALL_CAPS or starts with an underscore
      "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      // this is a straight port from plain JS, not a type-safety overhaul — `any` is used
      // pragmatically (API payloads, error shapes) rather than modeled in full
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
