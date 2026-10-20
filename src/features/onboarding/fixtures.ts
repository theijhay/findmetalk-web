import type { LandingLegalDocId } from "@/features/onboarding/landing-meta";

export interface LandingPreviewFixture {
  readonly id: "default" | "rules_open" | "privacy_open" | "terms_open";
  readonly activeDoc: LandingLegalDocId | null;
}

export const LANDING_PREVIEW_FIXTURES: readonly LandingPreviewFixture[] = [
  { id: "default", activeDoc: null },
  { id: "rules_open", activeDoc: "rules" },
  { id: "privacy_open", activeDoc: "privacy" },
  { id: "terms_open", activeDoc: "terms" },
] as const;

