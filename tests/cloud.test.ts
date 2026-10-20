import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  canCallFromCloud,
  type CloudEntry,
  computeLanguageRingSegments,
  CUSTOM_STATUS_MAX_LENGTH,
  EMPTY_CLOUD_FILTERS,
  filterCloudEntries,
  layoutSkyOrbs,
  MAX_ANIMATED_ORBS,
  MAX_SKY_ORBS,
  rankQuickMatchCandidates,
  resolveDefaultCloudView,
  validateCustomStatus,
} from "../src/lib/cloud.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function makeSampleEntries(count: number): CloudEntry[] {
  const langs = [["en", "yo"], ["ha", "en"], ["ig", "pcm", "en"], ["fr"]];
  const interests = [
    ["music", "football"],
    ["books", "study"],
    ["late_night", "tech"],
    ["cooking", "travel"],
  ] as const;

  return Array.from({ length: count }, (_, idx) => ({
    user_id: `00000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`,
    display_name: `Person ${idx + 1}`,
    avatar_id: "avatar_01" as const,
    languages: langs[idx % langs.length]!,
    interests: interests[idx % interests.length]!,
    intent: idx % 2 === 0 ? ("want_to_talk" as const) : ("happy_to_listen" as const),
    country: idx % 3 === 0 ? "NG" : idx % 3 === 1 ? "GH" : null,
    status: {
      preset: "just_chat" as const,
      custom: null,
    },
  }));
}

test("Spec 9.1, 9.2, FR-CLOUD-6: layoutSkyOrbs caps rendered orbs at 24, animated orbs at 12, and clears the own-orb dock across 200 entries", () => {
  const entries = makeSampleEntries(200);
  const placements = layoutSkyOrbs(entries, { reducedMotion: false });

  assert.equal(placements.length, MAX_SKY_ORBS);

  const animatedCount = placements.filter((p) => p.animated).length;
  assert.equal(animatedCount, MAX_ANIMATED_ORBS);

  for (const p of placements) {
    assert.ok(p.xPercent >= 12 && p.xPercent <= 88, `xPercent out of bounds: ${p.xPercent}`);
    assert.ok(p.yPercent >= 14 && p.yPercent <= 70, `yPercent out of bounds: ${p.yPercent}`);
    const inOwnOrbDock = p.yPercent > 62 && p.xPercent > 34 && p.xPercent < 66;
    assert.equal(inOwnOrbDock, false, "Sky orb must not overlap bottom-centre own-orb dock");
  }

  const reducedPlacements = layoutSkyOrbs(entries, { reducedMotion: true });
  assert.equal(
    reducedPlacements.filter((p) => p.animated).length,
    0,
    "No sky orb may animate when reducedMotion is true",
  );
});

test("Spec 9.2: computeLanguageRingSegments splits 1 to 3 spoken languages into segmented SVG arcs", () => {
  assert.equal(computeLanguageRingSegments([]).length, 0);

  const one = computeLanguageRingSegments(["yo"], 180);
  assert.equal(one.length, 1);
  assert.equal(one[0]?.code, "yo");
  assert.equal(one[0]?.strokeDashoffset, "0");

  const three = computeLanguageRingSegments(["ig", "pcm", "en", "fr"], 180);
  assert.equal(three.length, 3, "At most 3 spoken languages are rendered on the ring");
  assert.deepEqual(
    three.map((s) => s.code),
    ["ig", "pcm", "en"],
  );
});

test("FR-CLOUD-4: filterCloudEntries filters by language, opted-in country, interests and intent", () => {
  const entries = makeSampleEntries(12);

  const yorubaOnly = filterCloudEntries(entries, {
    ...EMPTY_CLOUD_FILTERS,
    language: "yo",
  });
  assert.ok(yorubaOnly.length > 0);
  assert.ok(yorubaOnly.every((e) => e.languages.includes("yo")));

  const nigeriaOnly = filterCloudEntries(entries, {
    ...EMPTY_CLOUD_FILTERS,
    country: "NG",
  });
  assert.ok(nigeriaOnly.length > 0);
  assert.ok(nigeriaOnly.every((e) => e.country === "NG"));

  const studyOrTech = filterCloudEntries(entries, {
    ...EMPTY_CLOUD_FILTERS,
    interests: ["study", "tech"],
  });
  assert.ok(studyOrTech.length > 0);
  assert.ok(
    studyOrTech.every(
      (e) => e.interests.includes("study") || e.interests.includes("tech"),
    ),
  );

  const listenOnly = filterCloudEntries(entries, {
    ...EMPTY_CLOUD_FILTERS,
    intent: "happy_to_listen",
  });
  assert.ok(listenOnly.length > 0);
  assert.ok(listenOnly.every((e) => e.intent === "happy_to_listen"));
});

test("Spec 9.3: resolveDefaultCloudView defaults to list view for reduced motion or screen readers", () => {
  assert.equal(
    resolveDefaultCloudView({ prefersReducedMotion: true }),
    "list",
  );
  assert.equal(
    resolveDefaultCloudView({
      prefersReducedMotion: false,
      screenReaderHint: true,
    }),
    "list",
  );
  assert.equal(
    resolveDefaultCloudView({ prefersReducedMotion: false }),
    "sky",
  );
});

test("FR-CLOUD-7: canCallFromCloud allows browsing while closed and disables Call with a clear reason", () => {
  assert.deepEqual(canCallFromCloud("open"), {
    allowed: true,
    reasonKey: null,
  });
  assert.deepEqual(canCallFromCloud("closed"), {
    allowed: false,
    reasonKey: "cloud.callDisabledClosed",
  });
  assert.deepEqual(canCallFromCloud("in_call"), {
    allowed: false,
    reasonKey: "cloud.callDisabledBusy",
  });
  assert.deepEqual(canCallFromCloud("in_circle"), {
    allowed: false,
    reasonKey: "cloud.callDisabledBusy",
  });
});

test("Spec 7.3: rankQuickMatchCandidates ranks by shared language first, then shared interests, then filtered country", () => {
  const candidates: CloudEntry[] = [
    {
      user_id: "u1",
      display_name: "One",
      avatar_id: "avatar_01",
      languages: ["fr"],
      interests: ["music", "books"],
      intent: "want_to_talk",
      country: "NG",
      status: { preset: "just_chat", custom: null },
    },
    {
      user_id: "u2",
      display_name: "Two",
      avatar_id: "avatar_02",
      languages: ["en", "yo"],
      interests: ["football"],
      intent: "happy_to_listen",
      country: null,
      status: { preset: "just_chat", custom: null },
    },
    {
      user_id: "u3",
      display_name: "Three",
      avatar_id: "avatar_03",
      languages: ["en", "yo"],
      interests: ["music", "books"],
      intent: "happy_to_listen",
      country: "NG",
      status: { preset: "just_chat", custom: null },
    },
  ];

  const ranked = rankQuickMatchCandidates(candidates, {
    languages: ["en", "yo"],
    interests: ["music", "books"],
  });
  assert.deepEqual(
    ranked.map((c) => c.user_id),
    ["u3", "u2", "u1"],
  );
});

test("Spec 9.4: validateCustomStatus enforces 1 to 60 trimmed characters", () => {
  assert.equal(validateCustomStatus("   ").valid, false);
  const ok = validateCustomStatus("  Up late revising, say hi  ");
  assert.equal(ok.valid, true);
  assert.equal(ok.trimmed, "Up late revising, say hi");
  assert.equal(
    validateCustomStatus("x".repeat(CUSTOM_STATUS_MAX_LENGTH + 1)).valid,
    false,
  );
});

test("FR-PROF-6 and no-fake-people rule: orbs never show photos, ProfileCard allows photos, and CloudScreen never imports fixtures", () => {
  const skyOrbSource = readFileSync(
    path.join(ROOT, "src/features/cloud/components/sky-orb.tsx"),
    "utf8",
  );
  const ownOrbSource = readFileSync(
    path.join(ROOT, "src/features/cloud/components/own-orb-bar.tsx"),
    "utf8",
  );
  const profileCardSource = readFileSync(
    path.join(ROOT, "src/features/cloud/components/profile-card-sheet.tsx"),
    "utf8",
  );
  const cloudScreenSource = readFileSync(
    path.join(ROOT, "src/features/cloud/components/cloud-screen.tsx"),
    "utf8",
  );
  const cloudPageSource = readFileSync(
    path.join(ROOT, "src/app/cloud/page.tsx"),
    "utf8",
  );

  assert.match(skyOrbSource, /allowPhoto=\{false\}/);
  assert.match(ownOrbSource, /allowPhoto=\{false\}/);
  assert.match(profileCardSource, /allowPhoto=\{true\}/);

  assert.doesNotMatch(
    cloudScreenSource,
    /from\s+["'][^"']*fixtures/,
    "CloudScreen must not import fixtures so fake people are never shown in the real app",
  );
  assert.doesNotMatch(
    cloudPageSource,
    /from\s+["'][^"']*fixtures/,
    "CloudPage must not import fixtures so fake people are never shown in the real app",
  );
});

