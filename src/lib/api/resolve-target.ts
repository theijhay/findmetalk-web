/** Everything reachable through the API proxy must live under here. */
export const ALLOWED_PREFIX = "/api/v1/";

/**
 * The upstream URL for a proxied request, or null if it escapes the allowed
 * prefix or the API's origin.
 *
 * Pattern-matching for ".." segments is not enough: a single URL-encoded
 * segment like `..%2F..%2Fhealth` arrives as one path element containing
 * slashes, slips past a `segment === ".."` check, and is then normalised by
 * fetch to a path outside /api/v1. So the URL is built, normalised by the
 * parser, and then checked for where it actually points.
 *
 * Kept free of imports so the node test runner can load it directly.
 */
export function resolveTarget(path: string[], search: string, apiUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(`${ALLOWED_PREFIX}${path.join("/")}${search}`, apiUrl);
  } catch {
    return null;
  }

  const base = new URL(apiUrl);
  if (url.origin !== base.origin) return null;
  if (!url.pathname.startsWith(ALLOWED_PREFIX)) return null;

  return url.toString();
}
