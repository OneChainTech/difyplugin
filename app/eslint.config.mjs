import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Do not fail builds on usage of `any`; keep as a warning for now
      "@typescript-eslint/no-explicit-any": "warn",
      // Reduce noise; allow prefix `_` to intentionally ignore unused variables
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // Keep exhaustive-deps as a warning to avoid blocking builds
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
