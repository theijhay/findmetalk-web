import {
  AVATAR_PRESET_IDS,
  SKY_PERIODS,
  STATUS_META,
  STATUS_PRESET_IDS,
  type AvatarPresetId,
  type SkyPeriod,
  type StatusPresetId,
} from "@/lib/theme";

export interface LanguageSpecimenFixture {
  readonly code: "en" | "pcm" | "yo" | "ha" | "ig" | "fr";
  readonly characters: string;
  readonly sample: string;
}

export const LANGUAGE_SPECIMENS: readonly LanguageSpecimenFixture[] = [
  {
    code: "yo",
    characters: "ẹ ọ ṣ Ẹ Ọ Ṣ á à é è í ì ó ò ú ù ń ǹ",
    sample: "Ẹ káàbọ̀, ṣé àlàáfíà ni? Mo ṣetan láti bá ọ sọ̀rọ̀ ní ìrọ̀lẹ́ yìí.",
  },
  {
    code: "ha",
    characters: "ɓ ɗ ƙ ƴ Ɓ Ɗ Ƙ Ƴ",
    sample: "Sannu, kana lafiya? Ina jin daɗin tattaunawa a ƙarƙashin sararin samaniya ba tare da ɓata lokaci ko ƴar damuwa ba.",
  },
  {
    code: "ig",
    characters: "ị ọ ụ ṅ Ị Ọ Ụ Ṅ",
    sample: "Nnọọ, kedụ ka ị mere? Obi dị m ụtọ ịnụ olu gị na ịṅa ntị n'ụbọchị taa.",
  },
  {
    code: "pcm",
    characters: "a b c d e f g h i j k l m n o p r s t u v w y z",
    sample: "How far, you dey okay? No wahala, make we talk small.",
  },
  {
    code: "fr",
    characters: "é è ê ë à â ç î ï ô ù û ü œ æ É È Ê Ç Œ",
    sample: "Bonsoir, quelqu'un pour discuter tranquillement ce soir à cœur ouvert ?",
  },
  {
    code: "en",
    characters: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z",
    sample: "Someone to talk to, by voice, right now.",
  },
] as const;

export interface PreviewProfileCardFixture {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id: AvatarPresetId;
  readonly photo_url: string | null;
  readonly languages: readonly string[];
  readonly interests: readonly string[];
  readonly intent: "want_to_talk" | "happy_to_listen" | null;
  readonly country: string | null;
  readonly status: {
    readonly preset: StatusPresetId | null;
    readonly custom: string | null;
  } | null;
}

/**
 * Deterministic inline SVG data URI used to preview the approved-photo state
 * on profile cards without external network requests.
 */
export const SAMPLE_APPROVED_PHOTO_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' +
      '<rect width="96" height="96" opacity="0.25"/>' +
      '<circle cx="48" cy="36" r="16" opacity="0.65"/>' +
      '<path d="M20 84c4-16 16-24 28-24s24 8 28 24" opacity="0.65"/>' +
      "</svg>",
  );

export const PREVIEW_PROFILE_FIXTURES: readonly PreviewProfileCardFixture[] = [
  {
    user_id: "f2a9d4c7-1b3e-4a6f-8d0c-5e7b9a1c3d62",
    display_name: "Tolu",
    avatar_id: "avatar_07",
    photo_url: null,
    languages: ["en", "yo"],
    interests: ["music", "books"],
    intent: "happy_to_listen",
    country: "NG",
    status: {
      preset: "cant_sleep",
      custom: null,
    },
  },
  {
    user_id: "8b6e0c1a-4f2d-4e7b-9c3a-1d5f7e9b2c40",
    display_name: "Amina",
    avatar_id: "avatar_02",
    photo_url: SAMPLE_APPROVED_PHOTO_DATA_URI,
    languages: ["ha", "en"],
    interests: ["study", "late_night"],
    intent: "want_to_talk",
    country: null,
    status: {
      preset: "just_chat",
      custom: null,
    },
  },
] as const;

export const PREVIEW_SKY_PALETTES: readonly {
  readonly period: SkyPeriod;
  readonly sampleHour: number;
}[] = SKY_PERIODS.map((period) => ({
  period,
  sampleHour:
    period === "dawn" ? 6 : period === "day" ? 13 : period === "dusk" ? 18 : 23,
}));

export const PREVIEW_STATUS_LIST = [
  ...STATUS_PRESET_IDS.map((id) => STATUS_META[id]),
  STATUS_META.custom,
] as const;

export const PREVIEW_AVATAR_PRESETS = AVATAR_PRESET_IDS;
