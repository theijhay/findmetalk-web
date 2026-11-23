import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  CALL_RECONNECT_WINDOW_SECONDS,
  CALL_REPORT_REASONS,
  computeReconnectCountdown,
  formatCallDuration,
  getAlwaysVisibleCallControls,
  getConnectionQualityMeta,
  getOtherCallParticipant,
  isWakeLockSupported,
  normalizeCallerRequestState,
  shouldKeepScreenAwake,
  shouldShowRecordingIndicator,
} from "../src/lib/calls.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

test("FR-CALL-4: skip, timeout and failure map identically to unavailable for the caller", () => {
  assert.equal(normalizeCallerRequestState("skipped"), "unavailable");
  assert.equal(normalizeCallerRequestState("expired"), "unavailable");
  assert.equal(normalizeCallerRequestState("failed"), "unavailable");
  assert.equal(normalizeCallerRequestState("unavailable"), "unavailable");
  assert.equal(normalizeCallerRequestState("ringing"), "ringing");
  assert.equal(normalizeCallerRequestState("accepted"), "accepted");
  assert.equal(normalizeCallerRequestState("cancelled"), "cancelled");
});

test("Spec 7.5, P4, P5: Mute, End, Report and Block stay always visible in every active call state", () => {
  assert.deepEqual(getAlwaysVisibleCallControls("in_call"), [
    "mute",
    "end",
    "report",
    "block",
  ]);
  assert.deepEqual(getAlwaysVisibleCallControls("reconnecting"), [
    "mute",
    "end",
    "report",
    "block",
  ]);
  assert.deepEqual(getAlwaysVisibleCallControls("post_call"), []);

  const inCallSource = readFileSync(
    path.join(ROOT, "src/features/calls/components/in-call-view.tsx"),
    "utf8",
  );
  assert.match(inCallSource, /tCalls\("inCall\.muteButton"\)/);
  assert.match(inCallSource, /tCalls\("inCall\.endButton"\)/);
  assert.match(inCallSource, /tCalls\("inCall\.reportButton"\)/);
  assert.match(inCallSource, /tCalls\("inCall\.blockButton"\)/);
});

test("REC-2: recording indicator shows whenever recorded is true and sensitive keys are in needs-review.json", () => {
  assert.equal(shouldShowRecordingIndicator({ recorded: true }), true);
  assert.equal(shouldShowRecordingIndicator({ recorded: false }), false);
  assert.equal(shouldShowRecordingIndicator(null), false);

  const needsReview = JSON.parse(
    readFileSync(path.join(ROOT, "messages/needs-review.json"), "utf8"),
  ) as Record<string, string>;
  assert.equal(needsReview["calls.recording.badge"], "REC-2");
  assert.equal(needsReview["calls.recording.notice"], "REC-2");
});

test("Spec 7.5: reconnect window counts down 15 seconds then ends gracefully", () => {
  assert.equal(CALL_RECONNECT_WINDOW_SECONDS, 15);
  assert.deepEqual(computeReconnectCountdown(0), {
    remainingSeconds: 15,
    timedOut: false,
  });
  assert.deepEqual(computeReconnectCountdown(9), {
    remainingSeconds: 6,
    timedOut: false,
  });
  assert.deepEqual(computeReconnectCountdown(15), {
    remainingSeconds: 0,
    timedOut: true,
  });
  assert.deepEqual(computeReconnectCountdown(22), {
    remainingSeconds: 0,
    timedOut: true,
  });
});

test("FR-CALL-9: call duration formats calmly for short and multi-hour calls with no time limit", () => {
  assert.equal(formatCallDuration(0), "00:00");
  assert.equal(formatCallDuration(65), "01:05");
  assert.equal(formatCallDuration(3661), "1:01:01");
  assert.equal(formatCallDuration(-5), "00:00");
});

test("Spec 9.6: Wake Lock feature detection degrades safely on iOS 15.4 and unsupported browsers", () => {
  assert.equal(isWakeLockSupported(null), false);
  assert.equal(isWakeLockSupported({}), false);
  assert.equal(isWakeLockSupported({ wakeLock: {} }), false);
  assert.equal(
    isWakeLockSupported({ wakeLock: { request: async () => ({}) } }),
    true,
  );
  assert.equal(shouldKeepScreenAwake("incoming"), true);
  assert.equal(shouldKeepScreenAwake("ringing"), true);
  assert.equal(shouldKeepScreenAwake("in_call"), true);
  assert.equal(shouldKeepScreenAwake("reconnecting"), true);
  assert.equal(shouldKeepScreenAwake("post_call"), false);
  assert.equal(shouldKeepScreenAwake("unavailable"), false);
});

test("Spec 7.5, SAFE-3: connection quality pairs icon with tokens and report covers all 7 reasons", () => {
  for (const quality of ["good", "fair", "poor", "reconnecting"] as const) {
    const meta = getConnectionQualityMeta(quality);
    assert.equal(meta.quality, quality);
    assert.ok(meta.icon.length > 0);
    assert.ok(!meta.textClass.includes("#"));
  }
  assert.deepEqual(CALL_REPORT_REASONS, [
    "harassment",
    "sexual_content",
    "hate",
    "scam",
    "underage",
    "self_harm",
    "other",
  ]);
  const peer = getOtherCallParticipant(
    {
      participants: [
        { user_id: "u1", display_name: "Ada", avatar_id: "avatar_02" },
        { user_id: "u2", display_name: "Tolu", avatar_id: "avatar_07" },
      ],
    },
    "u1",
  );
  assert.equal(peer?.user_id, "u2");
});

test("FR-PROF-6, no-fake-people and non-shaming copy: incoming card allows photo, CallScreen never imports fixtures, copy never says rejected", () => {
  const incomingSource = readFileSync(
    path.join(ROOT, "src/features/calls/components/incoming-call-view.tsx"),
    "utf8",
  );
  const callScreenSource = readFileSync(
    path.join(ROOT, "src/features/calls/components/call-screen.tsx"),
    "utf8",
  );
  const callPageSource = readFileSync(
    path.join(ROOT, "src/app/call/page.tsx"),
    "utf8",
  );
  const enMessages = JSON.parse(
    readFileSync(path.join(ROOT, "messages/en.json"), "utf8"),
  ) as { calls: unknown };

  assert.match(incomingSource, /allowPhoto=\{true\}/);
  assert.match(incomingSource, /incoming-orb-ripple/);
  assert.doesNotMatch(callScreenSource, /from\s+["'][^"']*fixtures["']/);
  assert.doesNotMatch(callPageSource, /from\s+["'][^"']*fixtures["']/);
  assert.doesNotMatch(JSON.stringify(enMessages.calls).toLowerCase(), /rejected/);
});
