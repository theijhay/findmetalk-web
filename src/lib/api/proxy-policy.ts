/**
 * API paths the browser may not reach through the proxy.
 *
 * Everything under /api/v1/auth/ returns or consumes session tokens (sign-in,
 * refresh, logout). Passed through, a token would land in browser JavaScript.
 * Those flows go through this app's own session route handlers instead, which
 * keep the tokens in HttpOnly cookies.
 *
 * Kept free of imports so the node test runner can load it directly.
 */
const BLOCKED_PREFIXES = ["/api/v1/auth/"];

export function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
