import { fileURLToPath } from "node:url";

const config = {
  plugins: {
    // First, so it reads the theme colours before Tailwind rewrites them, and
    // keeps translucent colours translucent where color-mix() is missing, such
    // as Safari on iOS 15. An absolute path, because Turbopack does not resolve
    // a relative plugin name from this directory.
    [fileURLToPath(new URL("./postcss-color-mix-fallback.mjs", import.meta.url))]: {},
    "@tailwindcss/postcss": {},
  },
};

export default config;
