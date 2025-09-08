import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    "rules": {
      "no-unused-vars": "off", // Ignore unused variables
      "@typescript-eslint/no-unused-vars": "off", // Ignore TypeScript unused vars
      "quotes": "off", // Ignore single/double quotes
      "react/no-unescaped-entities": "off" // Ignore unescaped characters like apostrophes
    },
  }),
]


export default eslintConfig;
