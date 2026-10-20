import assert from "node:assert/strict";
import test from "node:test";

import { isBlockedPath } from "../src/lib/api/proxy-policy.ts";
import { resolveTarget } from "../src/lib/api/resolve-target.ts";

const API = "http://api.internal:8000";

test("a normal path resolves under /api/v1/ with its query", () => {
  assert.equal(
    resolveTarget(["cloud"], "?language=yo&limit=20", API),
    "http://api.internal:8000/api/v1/cloud?language=yo&limit=20",
  );
  assert.equal(
    resolveTarget(["call-requests", "a7c9e1b3", "accept"], "", API),
    "http://api.internal:8000/api/v1/call-requests/a7c9e1b3/accept",
  );
});

test("dot segments that escape /api/v1/ are refused", () => {
  for (const path of [
    ["..", "health"],
    ["..", "..", "ready"],
    // Next decodes `..%2F..%2Fhealth` into one segment holding slashes.
    ["../../health"],
    ["%2e%2e", "health"],
    ["cloud", "..", "..", "health"],
  ]) {
    assert.equal(resolveTarget(path, "", API), null, path.join("/"));
  }
});

test("whatever the input, a target is on the API origin under /api/v1/, or refused", () => {
  const crafted = [
    ["", "", "evil.example", "x"],
    ["\\\\evil.example"],
    ["//evil.example"],
    ["..%2F..%2Fhealth"],
    ["%2F..%2F..%2Fhealth"],
    ["http:", "", "evil.example"],
    ["@evil.example"],
  ];
  for (const path of crafted) {
    const target = resolveTarget(path, "?next=//evil.example", API);
    if (target === null) continue;
    const url = new URL(target);
    assert.equal(url.origin, API, path.join("/"));
    assert.ok(url.pathname.startsWith("/api/v1/"), path.join("/"));
  }
});

test("session endpoints are never passed through", () => {
  assert.equal(isBlockedPath("/api/v1/auth/verify"), true);
  assert.equal(isBlockedPath("/api/v1/auth/refresh"), true);
  assert.equal(isBlockedPath("/api/v1/auth/code"), true);
  assert.equal(isBlockedPath("/api/v1/cloud"), false);
  assert.equal(isBlockedPath("/api/v1/authors"), false);
});
