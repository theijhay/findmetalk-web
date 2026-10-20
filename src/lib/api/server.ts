import "server-only";

/**
 * Where the Next.js server reaches findmetalk-api.
 *
 * Server-only on purpose: the browser never learns the API's origin and never
 * calls it directly. It calls /api/v1/* on this app, and the route handler
 * forwards with the session's access token.
 */
export const API_URL = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

/** Upper bound on one upstream call, so a hung API cannot hang a page. */
export const UPSTREAM_TIMEOUT_MS = 15_000;
