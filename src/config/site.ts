/**
 * The product name lives here and nowhere else (spec: never hardcode the
 * name). Copy reaches it through the `appName` message parameter.
 */
export const SITE = {
  name: "FindMeTalk",
  url: process.env.APP_URL ?? "http://localhost:3000",
} as const;
