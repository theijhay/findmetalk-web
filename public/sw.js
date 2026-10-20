/*
 * FindMeTalk service worker.
 *
 * Small on purpose. It does two things:
 *
 * 1. Keeps the app's built scripts, styles and fonts (/_next/static/) so the
 *    app opens fast on a slow connection. Those file names change with every
 *    deploy, so a stored copy can never be out of date.
 * 2. Shows /offline when a page cannot load because there is no connection.
 *
 * What it never does, because each would break something real:
 *
 * - It never touches /api/. That is the session, presence, calls and every
 *   piece of personal data. A stored response could show who was open an hour
 *   ago as open now, or one person's data to the next on a shared phone.
 * - It never stores pages other than /offline, which is the same for
 *   everybody.
 * - It never touches other origins (the API, LiveKit) or any non-GET request.
 *
 * Changing this file is what makes browsers install a new version. Bump
 * VERSION when the caching rules change, so the old caches are cleared.
 */

const VERSION = "v1";
const STATIC_CACHE = `findmetalk-static-${VERSION}`;
const OFFLINE_CACHE = `findmetalk-offline-${VERSION}`;
const OFFLINE_URL = "/offline";
// Each deploy adds new file names; the oldest are dropped past this count so
// the cache cannot grow for ever.
const STATIC_LIMIT = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      await keepPage(cache, OFFLINE_URL);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, OFFLINE_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith("findmetalk-") && !keep.has(name)).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(pageOrOffline(request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(storedFirst(request));
  }
});

// The offline page and its own styles and scripts, so it shows fully styled
// without a connection.
async function keepPage(cache, path) {
  const response = await fetch(path, { cache: "reload" });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  await cache.put(path, response.clone());
  const html = await response.text();
  const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || [])];
  await Promise.all(assets.map((asset) => cache.add(asset).catch(() => undefined)));
}

// Always the network. Only a failed connection, never an error page from the
// server, falls back to /offline.
async function pageOrOffline(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const offline = await caches.match(OFFLINE_URL, { cacheName: OFFLINE_CACHE });
    if (offline) return offline;
    throw error;
  }
}

async function storedFirst(request) {
  const stored = await caches.match(request);
  if (stored) return stored;
  const cache = await caches.open(STATIC_CACHE);
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
    trim(cache);
  }
  return response;
}

async function trim(cache) {
  const keys = await cache.keys();
  const extra = keys.length - STATIC_LIMIT;
  for (let i = 0; i < extra; i += 1) await cache.delete(keys[i]);
}
