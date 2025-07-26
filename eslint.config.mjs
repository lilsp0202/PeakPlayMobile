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
    ignores: [
      "src/generated/**",
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "public/sw.js",
      "public/workbox-*.js",
      "public/sw.js.map",
      "public/workbox-*.js.map",
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx"
    ]
  },
  {
    rules: {
      // Production-friendly rules for deployment
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn", 
      "@typescript-eslint/no-non-null-assertion": "warn",
      "prefer-const": "warn",
      "no-console": "off", // Allow console logs for debugging
      "react-hooks/exhaustive-deps": "warn",
      // Disable some strict rules for production deployment
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
