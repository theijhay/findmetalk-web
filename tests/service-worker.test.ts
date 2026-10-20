import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

type Handler = (event: unknown) => void;

function loadWorker() {
  const handlers: Record<string, Handler> = {};
  const self = {
    location: { origin: "https://app.example" },
    addEventListener: (name: string, handler: Handler) => {
      handlers[name] = handler;
    },
  };
  const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  const caches = {
    match: async () => undefined,
    open: async () => ({ put: async () => undefined, keys: async () => [], delete: async () => true }),
  };
  vm.runInNewContext(source, { self, URL, caches, fetch: () => Promise.reject(new Error("offline")) });
  return handlers;
}

function fetchEvent(url: string, init: { method?: string; mode?: string } = {}) {
  let responded = false;
  return {
    event: {
      request: { url, method: init.method ?? "GET", mode: init.mode ?? "no-cors" },
      respondWith: (response: Promise<unknown>) => {
        responded = true;
        // Settle it so nothing runs after the test ends.
        response.catch(() => undefined);
      },
    },
    responded: () => responded,
  };
}

test("API calls, other origins and writes are never intercepted", () => {
  const { fetch } = loadWorker();
  for (const [url, init] of [
    ["https://app.example/api/v1/cloud", {}],
    ["https://app.example/api/v1/presence", { mode: "navigate" }],
    ["https://media.example/rtc", {}],
    ["https://app.example/_next/static/app.js", { method: "POST" }],
  ] as const) {
    const probe = fetchEvent(url, init);
    fetch?.(probe.event);
    assert.equal(probe.responded(), false, url);
  }
});

test("build assets and page navigations are handled", () => {
  const { fetch } = loadWorker();
  for (const [url, init] of [
    ["https://app.example/_next/static/chunks/app.js", {}],
    ["https://app.example/settings", { mode: "navigate" }],
  ] as const) {
    const probe = fetchEvent(url, init);
    fetch?.(probe.event);
    assert.equal(probe.responded(), true, url);
  }
});
