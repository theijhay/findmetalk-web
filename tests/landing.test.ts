import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  LANDING_LEGAL_DOC_IDS,
  LANDING_LEGAL_DOCS,
  LANDING_PILLAR_IDS,
  isLandingLegalDocId,
} from "../src/features/onboarding/landing-meta.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

test("Spec 7.1, P7: landing exposes links to rules, privacy and terms and three core principles", () => {
  assert.deepEqual(LANDING_LEGAL_DOC_IDS, ["rules", "privacy", "terms"]);
  assert.deepEqual(LANDING_PILLAR_IDS, [
    "voice_only",
    "invitation_only",
    "one_tap_safety",
  ]);
  for (const id of LANDING_LEGAL_DOC_IDS) {
    assert.equal(isLandingLegalDocId(id), true);
    assert.equal(LANDING_LEGAL_DOCS[id].needsLegalReview, true);
  }
  assert.equal(isLandingLegalDocId("unknown"), false);
});

test("CR-5, Spec 11.5: landing copy names Olystique Ltd, is listed in messages/needs-review.json, and never links to /preview", () => {
  const enMessages = JSON.parse(
    fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf8"),
  ) as {
    home: {
      title: string;
      promise: string;
      enter: string;
      crisisDisclaimer: string;
      entityNote: string;
      links: Record<string, string>;
      legal: Record<string, string>;
    };
  };
  const needsReview = JSON.parse(
    fs.readFileSync(path.join(ROOT, "messages/needs-review.json"), "utf8"),
  ) as Record<string, string>;

  assert.equal(enMessages.home.enter, "Enter the cloud");
  assert.ok(enMessages.home.crisisDisclaimer.includes("not a crisis"));
  assert.ok(enMessages.home.entityNote.includes("Olystique Ltd"));
  assert.ok(enMessages.home.legal.privacyBody?.includes("Olystique Ltd"));
  assert.ok(enMessages.home.legal.termsBody?.includes("Olystique Ltd"));

  // Sensitive landing keys must be listed in messages/needs-review.json
  assert.equal(needsReview["home.crisisDisclaimer"], "CR-5");
  assert.equal(needsReview["home.entityNote"], "Spec 11.5");
  for (const key of Object.keys(enMessages.home.legal)) {
    assert.ok(
      Object.hasOwn(needsReview, `home.legal.${key}`),
      `home.legal.${key} must be listed in messages/needs-review.json`,
    );
  }

  // No hotline phone numbers hardcoded in landing copy
  assert.equal(/\d{3,}/.test(enMessages.home.crisisDisclaimer), false);

  const pageSource = fs.readFileSync(
    path.join(ROOT, "src/app/page.tsx"),
    "utf8",
  );
  const landingSource = fs.readFileSync(
    path.join(ROOT, "src/features/onboarding/components/landing-screen.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    pageSource,
    /\/preview\b/,
    "Home page must never link to /preview in production navigation",
  );
  assert.doesNotMatch(
    landingSource,
    /\/preview\b/,
    "LandingScreen must never link to /preview in production navigation",
  );
});
