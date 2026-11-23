import { SAMPLE_APPROVED_PHOTO_DATA_URI } from "@/components/ui/fixtures";
import type {
  CloudEntry,
  CloudStatusPresetId,
  CuratedInterestId,
  PresenceState,
  ProfileCardData,
  UserIntent,
} from "@/lib/cloud";

/**
 * Fixtures for /preview only, shaped exactly like API #17 (ProfileCard),
 * API #20 (PresenceState), API #21 (CloudEntry / GET /api/v1/cloud) and
 * API #24 (POST /api/v1/call-requests/quick-match).
 *
 * Never shown in the live application when wired to the API (no fake people).
 */

export const CLOUD_COUNTRY_CODES = ["NG", "GH", "FR", "GB", "US"] as const;
export type CloudCountryCode = (typeof CLOUD_COUNTRY_CODES)[number];

export const CLOUD_VIEWER_FIXTURE = {
  user_id: "8b6e0c1a-4f2d-4e7b-9c3a-1d5f7e9b2c40",
  display_name: "Ada",
  avatar_id: "avatar_02" as const,
  languages: ["en", "yo"] as const,
  interests: ["books", "music", "late_night"] as const,
  intent: "want_to_talk" as const,
  country: "NG" as const,
};

export const CLOUD_PRESENCE_OPEN_FIXTURE: PresenceState = {
  state: "open",
  status: {
    preset: "just_chat",
    custom: null,
  },
  opened_at: "2026-10-20T21:04:05Z",
  heartbeat_interval_seconds: 10,
  ttl_seconds: 30,
};

export const CLOUD_PRESENCE_CLOSED_FIXTURE: PresenceState = {
  state: "closed",
  status: {
    preset: "just_chat",
    custom: null,
  },
  opened_at: null,
  heartbeat_interval_seconds: 10,
  ttl_seconds: 30,
};

export const CLOUD_ENTRIES_FIXTURE: readonly CloudEntry[] = [
  {
    user_id: "f2a9d4c7-1b3e-4a6f-8d0c-5e7b9a1c3d62",
    display_name: "Tolu",
    avatar_id: "avatar_07",
    languages: ["en", "yo"],
    interests: ["music", "football", "late_night"],
    intent: "happy_to_listen",
    country: "NG",
    status: {
      preset: "happy_to_listen",
      custom: null,
    },
  },
  {
    user_id: "a1c8e3b2-9d4f-4c7a-8b1e-2f6d0a9c4e71",
    display_name: "Amina",
    avatar_id: "avatar_03",
    languages: ["ha", "en"],
    interests: ["books", "cooking", "travel"],
    intent: "want_to_talk",
    country: "NG",
    status: {
      preset: "just_chat",
      custom: null,
    },
  },
  {
    user_id: "c4e7b0d1-6a2f-4e8b-9c3d-1a5f8e2b7c90",
    display_name: "Chinedu",
    avatar_id: "avatar_05",
    languages: ["ig", "pcm", "en"],
    interests: ["study", "tech", "campus_life"],
    intent: "want_to_talk",
    country: null,
    status: {
      preset: "cant_sleep",
      custom: null,
    },
  },
  {
    user_id: "d9b2f5a8-3c1e-4d7b-8a6f-0e4c9b2d5a13",
    display_name: "Kemi",
    avatar_id: "avatar_01",
    languages: ["yo", "pcm"],
    interests: ["movies", "art", "music"],
    intent: "happy_to_listen",
    country: "NG",
    status: {
      preset: "rough_day",
      custom: null,
    },
  },
  {
    user_id: "e5f1a9c3-7b4d-4a2e-9f8c-3d6b1a0e5c82",
    display_name: "Moussa",
    avatar_id: "avatar_04",
    languages: ["fr", "ha"],
    interests: ["languages", "travel", "football"],
    intent: "want_to_talk",
    country: "FR",
    status: {
      preset: "practicing_language",
      custom: null,
    },
  },
  {
    user_id: "b7d3c6e9-2a5f-4b8d-8c1e-4f9a2d6b0e35",
    display_name: "Efua",
    avatar_id: "avatar_06",
    languages: ["en", "fr"],
    interests: ["books", "study", "campus_life"],
    intent: "happy_to_listen",
    country: "GH",
    status: {
      preset: "study_break",
      custom: null,
    },
  },
  {
    user_id: "9e4a1c7f-5d2b-4f6a-8e3c-7b0d9a2e4f18",
    display_name: "Seyi",
    avatar_id: "avatar_08",
    languages: ["pcm", "en"],
    interests: ["football", "movies", "late_night"],
    intent: null,
    country: "GB",
    status: {
      preset: "bored_say_hi",
      custom: null,
    },
  },
  {
    user_id: "6c2f8a4d-1e9b-4c5a-9d7e-2a4b6c8f0e11",
    display_name: "Ngozi",
    avatar_id: "avatar_02",
    languages: ["ig", "en"],
    interests: ["study", "books", "tech"],
    intent: "want_to_talk",
    country: null,
    status: {
      preset: null,
      custom: "Up late revising, say hi",
    },
  },
] as const;

export const CLOUD_PROFILE_CARDS_FIXTURE: Readonly<
  Record<string, ProfileCardData>
> = Object.fromEntries(
  CLOUD_ENTRIES_FIXTURE.map((entry) => [
    entry.user_id,
    {
      ...entry,
      // Amina has an approved photo (shown on her ProfileCard, never on her sky orb per FR-PROF-6)
      photo_url:
        entry.display_name === "Amina" ? SAMPLE_APPROVED_PHOTO_DATA_URI : null,
    },
  ]),
);

const PRESET_ROTATION: readonly CloudStatusPresetId[] = [
  "just_chat",
  "rough_day",
  "happy_to_listen",
  "cant_sleep",
  "practicing_language",
  "bored_say_hi",
  "study_break",
];

const AVATAR_ROTATION = [
  "avatar_01",
  "avatar_02",
  "avatar_03",
  "avatar_04",
  "avatar_05",
  "avatar_06",
  "avatar_07",
  "avatar_08",
] as const;

const LANGUAGE_SETS: readonly (readonly string[])[] = [
  ["en", "yo"],
  ["ha", "en"],
  ["ig", "pcm", "en"],
  ["yo", "pcm"],
  ["fr", "en"],
  ["pcm", "en"],
];

const INTEREST_SETS: readonly (readonly CuratedInterestId[])[] = [
  ["music", "late_night"],
  ["books", "study", "campus_life"],
  ["football", "movies"],
  ["tech", "cooking", "travel"],
  ["art", "languages"],
];

const INTENT_ROTATION: readonly (UserIntent | null)[] = [
  "want_to_talk",
  "happy_to_listen",
  null,
];

const COUNTRY_ROTATION: readonly (CloudCountryCode | null)[] = [
  "NG",
  null,
  "GH",
  "FR",
  "GB",
  null,
];

const SAMPLE_NAMES = [
  "Tolu",
  "Amina",
  "Chinedu",
  "Kemi",
  "Moussa",
  "Efua",
  "Seyi",
  "Ngozi",
  "Bolanle",
  "Ibrahim",
  "Chiamaka",
  "Damilola",
  "Zainab",
  "Obinna",
  "Fatima",
  "Kofi",
] as const;

/**
 * Generates a deterministic 200-person cloud fixture for verifying the
 * low-end Android / 4x CPU throttle requirement on /preview (Spec 9.1, FR-CLOUD-6).
 */
export function generateLargeCloudFixture(count = 200): CloudEntry[] {
  const result: CloudEntry[] = [];
  for (let i = 0; i < count; i += 1) {
    if (i < CLOUD_ENTRIES_FIXTURE.length) {
      result.push(CLOUD_ENTRIES_FIXTURE[i]!);
      continue;
    }
    const baseName = SAMPLE_NAMES[i % SAMPLE_NAMES.length]!;
    const preset = PRESET_ROTATION[i % PRESET_ROTATION.length]!;
    result.push({
      user_id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      display_name: `${baseName} ${i + 1}`,
      avatar_id: AVATAR_ROTATION[i % AVATAR_ROTATION.length]!,
      languages: LANGUAGE_SETS[i % LANGUAGE_SETS.length]!,
      interests: INTEREST_SETS[i % INTEREST_SETS.length]!,
      intent: INTENT_ROTATION[i % INTENT_ROTATION.length] ?? null,
      country: COUNTRY_ROTATION[i % COUNTRY_ROTATION.length] ?? null,
      status: {
        preset,
        custom: null,
      },
    });
  }
  return result;
}

