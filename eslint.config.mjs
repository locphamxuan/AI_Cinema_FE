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
    // Keep files small and single-purpose. Split a file before it grows past
    // this — large files are a signal to extract a component/hook/slice.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Seed/fixture data is not logic — line count there tracks the dataset,
    // not code complexity.
    files: ["src/mocks/**/*.{ts,tsx}"],
    rules: {
      "max-lines": "off",
    },
  },
]);

export default eslintConfig;
