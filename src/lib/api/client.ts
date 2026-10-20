import createClient from "openapi-fetch";

import type { paths } from "@/types/api.gen";

/**
 * The typed API client for client components.
 *
 * Paths, bodies and responses come from the generated contract types, so a
 * call that does not match the API fails type-checking. Requests go to
 * /api/v1/* on this app's own origin; the route handler there adds the
 * session. Server components call the API from the server instead.
 */
export const api = createClient<paths>({ baseUrl: "" });

/** The API's error body (findmetalk-api AGENTS.md, API conventions). */
export interface ApiErrorBody {
  error: {
    code: string;
    fields?: { field: string; code: string }[];
    request_id: string | null;
  };
}

/** The message key for an error, under `errors.` in messages/. */
export function errorMessageKey(body: unknown): string {
  const code = (body as Partial<ApiErrorBody> | null)?.error?.code;
  return typeof code === "string" && /^[a-z0-9_.]+$/.test(code) ? code : "unknown";
}
