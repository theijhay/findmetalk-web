import "server-only";

import { cookies } from "next/headers";

/**
 * Cookie-backed session.
 *
 * Tokens live in HttpOnly cookies on this app's origin and are attached to API
 * calls by the route handler. They are never serialised into HTML or exposed to
 * client JavaScript, so an XSS bug on any page cannot take them.
 */

export const ACCESS_COOKIE = "fmt_at";
export const REFRESH_COOKIE = "fmt_rt";

/** The token pair the API returns from sign-in and refresh. */
export interface SessionTokens {
  access_token: string;
  refresh_token: string;
  expires_in_seconds: number;
}

// Fallback lifetime for the refresh cookie when the API does not say. The API
// decides when a session really ends; a cookie outliving it only carries a
// dead credential.
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  // Secure everywhere except local http development.
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setSession(tokens: SessionTokens): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.access_token, {
    ...baseCookie,
    maxAge: Math.max(60, Math.floor(tokens.expires_in_seconds)),
  });
  jar.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
