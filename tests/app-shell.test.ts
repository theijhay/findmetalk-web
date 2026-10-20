import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  isHelpControlVisible,
  NAV_ITEMS,
  resolveActiveNavTab,
  SHELL_SURFACES,
  shouldShowPrimaryNav,
} from "../src/lib/navigation.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

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

test("Spec 9.5: primary navigation is shown on Cloud, Recents and Settings and hidden during calls and circles", () => {
  assert.equal(shouldShowPrimaryNav("cloud"), true);
  assert.equal(shouldShowPrimaryNav("recents"), true);
  assert.equal(shouldShowPrimaryNav("settings"), true);
  assert.equal(shouldShowPrimaryNav("call"), false);
  assert.equal(shouldShowPrimaryNav("circle"), false);
});

test("CR-5: crisis/companion positioning copy is marked NEEDS REVIEW and contains no hardcoded hotline numbers", () => {
  const previewSource = readFileSync(
    path.join(ROOT, "src/features/preview/components/design-system-preview.tsx"),
    "utf8",
  );
  assert.match(previewSource, /NEEDS REVIEW \(CR-5/);

  const messages = readFileSync(path.join(ROOT, "messages/en.json"), "utf8");
  // Ensure no phone/hotline digits like 988, 911, 112 are hardcoded in shell.helpSheet
  const parsed = JSON.parse(messages) as {
    shell: { helpSheet: Record<string, string> };
  };
  for (const [key, val] of Object.entries(parsed.shell.helpSheet)) {
    assert.ok(!/\d{3,}/.test(val), `shell.helpSheet.${key} must not hardcode hotline numbers`);
  }
});
