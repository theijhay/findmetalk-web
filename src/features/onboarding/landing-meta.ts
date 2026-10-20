/**
 * Pure metadata and helpers for the landing page (Spec 7.1, P7, CR-5, Spec 11.5).
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const LANDING_LEGAL_DOC_IDS = ["rules", "privacy", "terms"] as const;
export type LandingLegalDocId = (typeof LANDING_LEGAL_DOC_IDS)[number];

export interface LandingLegalDocMeta {
  readonly id: LandingLegalDocId;
  readonly href: string;
  readonly linkKey: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly needsLegalReview: true;
}

export const LANDING_LEGAL_DOCS: Readonly<Record<LandingLegalDocId, LandingLegalDocMeta>> = {
  rules: {
    id: "rules",
    href: "#community-rules",
    linkKey: "home.links.rules",
    titleKey: "home.legal.rulesTitle",
    bodyKey: "home.legal.rulesBody",
    needsLegalReview: true,
  },
  privacy: {
    id: "privacy",
    href: "#privacy-policy",
    linkKey: "home.links.privacy",
    titleKey: "home.legal.privacyTitle",
    bodyKey: "home.legal.privacyBody",
    needsLegalReview: true,
  },
  terms: {
    id: "terms",
    href: "#terms-of-service",
    linkKey: "home.links.terms",
    titleKey: "home.legal.termsTitle",
    bodyKey: "home.legal.termsBody",
    needsLegalReview: true,
  },
};

export const LANDING_PILLAR_IDS = ["voice_only", "invitation_only", "one_tap_safety"] as const;
export type LandingPillarId = (typeof LANDING_PILLAR_IDS)[number];

export function isLandingLegalDocId(value: string | null | undefined): value is LandingLegalDocId {
  return value === "rules" || value === "privacy" || value === "terms";
}

