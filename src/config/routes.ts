/**
 * Canonical application route paths.
 * Kept free of imports so tests and server or client modules can load it directly.
 */
export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  cloud: "/cloud",
  call: "/call",
  help: "/help",
  suspended: "/suspended",
  recents: "/recents",
  settings: "/settings",
} as const;

