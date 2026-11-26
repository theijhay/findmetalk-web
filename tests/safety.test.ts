import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  APPEAL_MESSAGE_MAX_LENGTH,
  canSubmitAppeal,
  FIND_A_HELPLINE_PROVIDER,
  inferCountryFromLocale,
  isPriorityReportReason,
  REPORT_NOTE_MAX_LENGTH,
  REPORT_REASONS,
  validateAppealMessage,
  validateReportNote,
} from "../src/lib/safety.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

test("SAFE-3, SAFE-4, API #28: report reasons match API contract and priority reasons are flagged", () => {
  assert.deepEqual(REPORT_REASONS, [
    "harassment",
    "sexual_content",
    "hate",
    "scam",
    "underage",
    "self_harm_concern",
    "other",
  ]);
  assert.equal(isPriorityReportReason("underage"), true);
  assert.equal(isPriorityReportReason("self_harm_concern"), true);
  assert.equal(isPriorityReportReason("harassment"), false);

  assert.deepEqual(validateReportNote("   "), { valid: true, normalized: null });
  assert.equal(validateReportNote("Short note").valid, true);
  assert.equal(
    validateReportNote("a".repeat(REPORT_NOTE_MAX_LENGTH + 1)).valid,
    false,
  );
});

test("CR-1, CR-2, CR-3, CR-4, OPEN-25: Find A Helpline provider builds country and fallback links without hotline numbers", () => {
  const ng = FIND_A_HELPLINE_PROVIDER.getDirectoryLink("NG");
  assert.equal(ng.mode, "link");
  assert.equal(ng.url, "https://findahelpline.com/countries/ng");

  const global = FIND_A_HELPLINE_PROVIDER.getDirectoryLink(null);
  assert.equal(global.url, "https://findahelpline.com/");

  assert.equal(inferCountryFromLocale(["en-NG", "en"]), "NG");
  assert.equal(inferCountryFromLocale(["yo_NG"]), "NG");
  assert.equal(inferCountryFromLocale("fr-FR"), "FR");
  assert.equal(inferCountryFromLocale(["en"]), null);
  assert.equal(inferCountryFromLocale(null), null);

  const helpScreenSource = readFileSync(
    path.join(ROOT, "src/features/help/components/help-screen.tsx"),
    "utf8",
  );
  assert.doesNotMatch(helpScreenSource, /\b911\b|\b988\b|\b999\b|\b112\b/);
});

test("Spec 11.3 Appeals, API #44: appeal validation and eligibility enforce one appeal per action", () => {
  assert.equal(validateAppealMessage("").valid, false);
  assert.equal(validateAppealMessage("   ").valid, false);
  assert.equal(validateAppealMessage("This was a misunderstanding.").valid, true);
  assert.equal(
    validateAppealMessage("x".repeat(APPEAL_MESSAGE_MAX_LENGTH + 1)).valid,
    false,
  );

  const action = {
    id: "a1",
    action: "suspend" as const,
    reason: "Test",
    ends_at: null,
  };
  assert.equal(
    canSubmitAppeal({ action, appeal: null, can_appeal: true }),
    true,
  );
  assert.equal(
    canSubmitAppeal({
      action,
      appeal: { id: "ap1", state: "open", created_at: "2026-10-19T00:00:00Z" },
      can_appeal: true,
    }),
    false,
  );
  assert.equal(
    canSubmitAppeal({ action, appeal: null, can_appeal: false }),
    false,
  );
});

test("API #44 and no-fake-people rule: appeal error codes exist in en.json and safety/help screens never import fixtures", () => {
  const en = JSON.parse(
    readFileSync(path.join(ROOT, "messages/en.json"), "utf8"),
  ) as {
    errors: {
      account: Record<string, string>;
      appeal: Record<string, string>;
    };
  };

  assert.ok((en.errors.account.suspended ?? "").length > 0);
  assert.ok((en.errors.appeal.already_exists ?? "").length > 0);
  assert.ok((en.errors.appeal.closed ?? "").length > 0);
  assert.ok((en.errors.appeal.same_moderator ?? "").length > 0);

  const productionFiles = [
    "src/features/help/components/help-screen.tsx",
    "src/features/safety/components/report-screen.tsx",
    "src/features/safety/components/block-confirm-view.tsx",
    "src/features/safety/components/suspension-screen.tsx",
    "src/app/help/page.tsx",
    "src/app/suspended/page.tsx",
  ];

  for (const rel of productionFiles) {
    const src = readFileSync(path.join(ROOT, rel), "utf8");
    assert.doesNotMatch(
      src,
      /from\s+["'][^"']*fixtures["']/,
      `${rel} must never import fixtures`,
    );
  }
});
