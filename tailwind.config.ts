import type { Config } from "tailwindcss";

/**
 * RTL-safe styling policy:
 * Use logical Tailwind utilities only — ms/me/ps/pe, start/end, inset-inline-*.
 * Avoid physical directional classes (ml/mr/pl/pr/left/right/text-left/text-right).
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
