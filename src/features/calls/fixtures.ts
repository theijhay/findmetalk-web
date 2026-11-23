import type {
  CallCallerCard,
  CallData,
  CallRequestData,
  CallSuggestion,
  IncomingCallEventData,
  RecentEntryData,
} from "@/lib/calls";

/**
 * Fixtures for `/preview` only, shaped exactly like the schemas in
 * findmetalk-api #22 (Call request lifecycle), #26 (Voice call lifecycle),
 * #30 (Recents) and #31 (Post-call feedback).
 *
 * Never import this file into production pages or CallScreen.
 */

export const CALL_VIEWER_USER_ID = "8b6e0c1a-4f2d-4e7b-9c3a-1d5f7e9b2c40";

export const CALL_PEER_CARD_FIXTURE: CallCallerCard = {
  user_id: "f2a9d4c7-1b3e-4a6f-8d0c-5e7b9a1c3d62",
  display_name: "Tolu",
  avatar_id: "avatar_07",
  photo_url: null,
  languages: ["en", "yo"],
  interests: ["music", "football", "late_night"],
  intent: "happy_to_listen",
  country: "NG",
  status: {
    preset: "cant_sleep",
    custom: null,
  },
};

export const INCOMING_CALL_FIXTURE: IncomingCallEventData = {
  request_id: "a7c9e1b3-5d7f-4a2c-9e4b-6d8f0a2c4e63",
  caller: CALL_PEER_CARD_FIXTURE,
  expires_at: "2026-10-19T21:04:25Z",
};

export const OUTGOING_REQUEST_FIXTURE: CallRequestData = {
  id: "a7c9e1b3-5d7f-4a2c-9e4b-6d8f0a2c4e63",
  state: "ringing",
  source: "browse",
  caller_id: CALL_VIEWER_USER_ID,
  callee_id: CALL_PEER_CARD_FIXTURE.user_id,
  created_at: "2026-10-19T21:04:05Z",
  expires_at: "2026-10-19T21:04:25Z",
};

export const UNAVAILABLE_SUGGESTIONS_FIXTURE: readonly CallSuggestion[] = [
  {
    user_id: "a1c8e3b2-9d4f-4c7a-8b1e-2f6d0a9c4e71",
    display_name: "Ada",
    avatar_id: "avatar_02",
    languages: ["en", "ig"],
    status: { preset: "happy_to_listen", custom: null },
  },
  {
    user_id: "c4e7b2d9-3a5f-4e8c-9b2d-7a1f6e3c8d45",
    display_name: "Musa",
    avatar_id: "avatar_04",
    languages: ["ha", "en"],
    status: { preset: "just_chat", custom: null },
  },
  {
    user_id: "e9a4d7c1-6b2e-4f5a-8c3d-1b7e9a4f2c68",
    display_name: "Amélie",
    avatar_id: "avatar_06",
    languages: ["fr", "en"],
    status: { preset: "study_break", custom: null },
  },
];

export const ACTIVE_CALL_RECORDED_FIXTURE: CallData = {
  id: "6d1e3a5c-7b9f-4c2e-a4d6-8f0b2c4e6a81",
  request_id: "a7c9e1b3-5d7f-4a2c-9e4b-6d8f0a2c4e63",
  participants: [
    {
      user_id: CALL_VIEWER_USER_ID,
      display_name: "Ada",
      avatar_id: "avatar_02",
    },
    {
      user_id: CALL_PEER_CARD_FIXTURE.user_id,
      display_name: "Tolu",
      avatar_id: "avatar_07",
    },
  ],
  started_at: "2026-10-19T21:04:25Z",
  ended_at: null,
  recorded: true,
};

export const ACTIVE_CALL_UNRECORDED_FIXTURE: CallData = {
  ...ACTIVE_CALL_RECORDED_FIXTURE,
  id: "9b2f4d6e-1c3a-4e8b-9f5d-2a7c4e6b8d10",
  recorded: false,
};

export const POST_CALL_RECENT_FIXTURE: RecentEntryData = {
  user_id: CALL_PEER_CARD_FIXTURE.user_id,
  display_name: "Tolu",
  avatar_id: "avatar_07",
  last_call_at: "2026-10-19T21:14:25Z",
  is_open: true,
};
