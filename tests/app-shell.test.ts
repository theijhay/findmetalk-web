import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_RECONNECT_WINDOW_SECONDS,
  isHelpControlVisible,
  NAV_ITEMS,
  resolveActiveNavTab,
  SHELL_SURFACES,
  shouldShowPrimaryNav,
} from "../src/lib/navigation.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function collectLeafKeys(
  node: Record<string, unknown>,
  prefix = "",
): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(node)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result.set(fullKey, value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [childKey, childVal] of collectLeafKeys(
        value as Record<string, unknown>,
        fullKey,
      )) {
        result.set(childKey, childVal);
      }
    }
  }
  return result;
}

test("Spec 9.5: primary navigation covers Cloud, Recents and Settings", () => {
  assert.deepEqual(
    NAV_ITEMS.map((item) => item.id),
    ["cloud", "recents", "settings"],
  );
  assert.equal(resolveActiveNavTab("/cloud"), "cloud");
  assert.equal(resolveActiveNavTab("/cloud/filter?lang=yo"), "cloud");
  assert.equal(resolveActiveNavTab("/recents"), "recents");
  assert.equal(resolveActiveNavTab("/settings"), "settings");
  assert.equal(resolveActiveNavTab("/settings/privacy/"), "settings");
  assert.equal(resolveActiveNavTab("/help"), null);
  assert.equal(resolveActiveNavTab("/"), null);
});

test("Spec 7.7: 'I need help' control is visible across every screen surface, including calls and circles", () => {
  for (const surface of SHELL_SURFACES) {
    assert.equal(
      isHelpControlVisible(surface),
      true,
      `Help control must be visible on ${surface}`,
    );
  }
});

test("Spec 7.7, CR-2, CR-5: HelpControl opens the Sheet directly in one tap and never links to a missing /help route", () => {
  const helpControlSource = readFileSync(
    path.join(ROOT, "src/components/layout/help-control.tsx"),
    "utf8",
  );
  const appShellSource = readFileSync(
    path.join(ROOT, "src/components/layout/app-shell.tsx"),
    "utf8",
  );

  assert.doesNotMatch(
    helpControlSource,
    /["']\/help(?:["'/?#]|$)/,
    "HelpControl must not link to /help before #8 ships",
  );
  assert.doesNotMatch(
    helpControlSource,
    /next\/link/,
    "HelpControl must be an interactive button opening the Sheet, not a route link",
  );
  assert.doesNotMatch(
    appShellSource,
    /["']\/help(?:["'/?#]|$)/,
    "AppShell must not link to /help before #8 ships",
  );

  assert.match(helpControlSource, /<button[\s\S]*type="button"/);
  assert.match(helpControlSource, /<Sheet\b/);
  assert.match(helpControlSource, /helpSheet\.title/);
  assert.match(helpControlSource, /helpSheet\.companionNotice/);
  assert.match(helpControlSource, /helpSheet\.emergencyFallback/);
  assert.match(helpControlSource, /helpSheet\.backToCloud/);
});

test("Spec 9.5: primary navigation is shown on Cloud, Recents and Settings and hidden during calls and circles", () => {
  assert.equal(shouldShowPrimaryNav("cloud"), true);
  assert.equal(shouldShowPrimaryNav("recents"), true);
  assert.equal(shouldShowPrimaryNav("settings"), true);
  assert.equal(shouldShowPrimaryNav("call"), false);
  assert.equal(shouldShowPrimaryNav("circle"), false);
});

test("Spec 7.5: reconnecting banner copy uses {seconds} parameter rather than a hardcoded duration", () => {
  assert.equal(DEFAULT_RECONNECT_WINDOW_SECONDS, 15);
  const enMessages = JSON.parse(
    readFileSync(path.join(ROOT, "messages/en.json"), "utf8"),
  ) as {
    shell: { banners: { reconnectingBody: string } };
  };
  assert.match(
    enMessages.shell.banners.reconnectingBody,
    /\{seconds\}/,
    "shell.banners.reconnectingBody must parameterize {seconds}",
  );
  assert.doesNotMatch(
    enMessages.shell.banners.reconnectingBody,
    /\b15\b/,
    "shell.banners.reconnectingBody must not hardcode 15",
  );
});

test("CR-2, CR-5: sensitive copy is listed in messages/needs-review.json and contains no hardcoded hotline numbers", () => {
  const enMessages = JSON.parse(
    readFileSync(path.join(ROOT, "messages/en.json"), "utf8"),
  ) as Record<string, unknown>;
  const needsReview = JSON.parse(
    readFileSync(path.join(ROOT, "messages/needs-review.json"), "utf8"),
  ) as Record<string, string>;

  const leafKeys = collectLeafKeys(enMessages);

  // Every key in needs-review.json must exist in en.json and map to a requirement ID
  for (const [key, reqId] of Object.entries(needsReview)) {
    assert.ok(
      leafKeys.has(key),
      `messages/needs-review.json key "${key}" does not exist in messages/en.json`,
    );
    assert.ok(
      typeof reqId === "string" && reqId.trim().length > 0,
      `messages/needs-review.json key "${key}" must have a requirement ID`,
    );
  }

  // Every key under shell.helpSheet.* (and later help.*, consent.*, legal.*, home.legal.*) must be in needs-review.json
  const sensitivePrefixes = [
    "shell.helpSheet.",
    "home.legal.",
    "home.crisisDisclaimer",
    "home.entityNote",
    "help.",
    "consent.",
    "legal.",
  ];
  for (const [key, val] of leafKeys.entries()) {
    if (sensitivePrefixes.some((prefix) => key.startsWith(prefix))) {
      assert.ok(
        Object.hasOwn(needsReview, key),
        `Sensitive message key "${key}" must be listed in messages/needs-review.json`,
      );
      assert.ok(
        !/\d{3,}/.test(val),
        `${key} must not hardcode hotline numbers`,
      );
    }
  }
});
