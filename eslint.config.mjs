import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const physicalDirectionPattern =
  "\\b(?:ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|float-left|float-right|border-l-|border-r-|rounded-l-|rounded-r-)";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Enforce no-console as an error in production, warn in development to preserve developer ergonomics.
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute[name.name="className"] > Literal[value=/${physicalDirectionPattern}/]`,
          message:
            "Use logical Tailwind utilities (ms/me/ps/pe/start/end/inset-inline-*) instead of physical left/right classes.",
        },
        {
          selector: `JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral TemplateElement[value.raw=/${physicalDirectionPattern}/]`,
          message:
            "Use logical Tailwind utilities (ms/me/ps/pe/start/end/inset-inline-*) instead of physical left/right classes.",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/**",
  ]),
]);

export default eslintConfig;
