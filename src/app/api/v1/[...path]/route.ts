import { NextResponse } from "next/server";

import { isBlockedPath } from "@/lib/api/proxy-policy";
import { resolveTarget } from "@/lib/api/resolve-target";
import { API_URL, UPSTREAM_TIMEOUT_MS } from "@/lib/api/server";
import { refreshSession } from "@/lib/auth/refresh";
import { clearSession, getAccessToken, getRefreshToken } from "@/lib/auth/session";

/**
 * Same-origin pass-through to findmetalk-api.
 *
 * The browser calls /api/v1/<path> on this app, with the same paths and bodies
 * as the API contract; this handler attaches the access token from the
 * HttpOnly cookie and forwards. The browser never holds a session credential,
 * and the API's origin stays private.
 */

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "accept-language", "x-request-id"];
const FORWARDED_RESPONSE_HEADERS = ["content-type", "retry-after", "x-request-id"];

/** An error in the API's own shape, so the client handles one format. */
function proxyError(status: number, code: string): NextResponse {
  return NextResponse.json({ error: { code, request_id: null } }, { status });
}

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = resolveTarget(path, new URL(request.url).search, API_URL);
  if (!target) return proxyError(400, "proxy.invalid_path");
  if (isBlockedPath(new URL(target).pathname)) return proxyError(404, "not_found");

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  async function callUpstream(token: string | undefined): Promise<Response> {
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    return fetch(target as string, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]),
    });
  }

  let upstream: Response;
  try {
    let token = await getAccessToken();
    let refreshed = false;
    if (!token && (await getRefreshToken())) {
      const result = await refreshSession();
      if (result.ok) {
        token = result.tokens.access_token;
        refreshed = true;
      }
    }

    upstream = await callUpstream(token);

    // The access token may have expired between requests. Refresh once and
    // replay; never loop, and never send the refresh token as a bearer.
    if (upstream.status === 401 && token && !refreshed) {
      const result = await refreshSession();
      if (result.ok) {
        upstream = await callUpstream(result.tokens.access_token);
      }
    }
    if (upstream.status === 401 && token) await clearSession();
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return proxyError(timedOut ? 504 : 502, timedOut ? "upstream_timeout" : "upstream_unavailable");
  }

  const response = new NextResponse(upstream.status === 204 ? null : await upstream.text(), {
    status: upstream.status,
  });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) response.headers.set(name, value);
  }
  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
