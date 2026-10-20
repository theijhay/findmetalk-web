import "server-only";

import { API_URL, UPSTREAM_TIMEOUT_MS } from "@/lib/api/server";
import { clearSession, getRefreshToken, setSession, type SessionTokens } from "@/lib/auth/session";

export type RefreshResult = { ok: true; tokens: SessionTokens } | { ok: false; status: number };

// Several route-handler invocations can need a refresh at the same moment. The
// refresh token is single use, so exchanges for the same token are coalesced
// inside this server process: it rotates once, and every caller gets the pair.
const inFlight = new Map<string, Promise<RefreshResult>>();

function isTokens(value: unknown): value is SessionTokens {
  const v = value as Partial<SessionTokens> | null;
  return (
    !!v &&
    typeof v.access_token === "string" &&
    typeof v.refresh_token === "string" &&
    typeof v.expires_in_seconds === "number"
  );
}

async function exchange(refreshToken: string): Promise<RefreshResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, status: 502 };
  }
  if (!response.ok) return { ok: false, status: response.status };

  const payload: unknown = await response.json().catch(() => null);
  return isTokens(payload) ? { ok: true, tokens: payload } : { ok: false, status: 502 };
}

/**
 * Exchange the HttpOnly refresh cookie for a fresh token pair and store it.
 *
 * Returns tokens only to its route-handler caller; nothing reaches the
 * browser. A refused refresh clears the session. A transient failure leaves
 * the cookies in place so a later request can recover.
 */
export async function refreshSession(): Promise<RefreshResult> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearSession();
    return { ok: false, status: 401 };
  }

  let pending = inFlight.get(refreshToken);
  if (!pending) {
    pending = exchange(refreshToken);
    inFlight.set(refreshToken, pending);
  }
  const result = await pending;
  if (inFlight.get(refreshToken) === pending) inFlight.delete(refreshToken);

  if (result.ok) {
    await setSession(result.tokens);
  } else if ([400, 401, 403].includes(result.status)) {
    await clearSession();
  }
  return result;
}
