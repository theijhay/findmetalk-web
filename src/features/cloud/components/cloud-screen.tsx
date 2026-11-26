"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { AppShell } from "@/components/layout/app-shell";
import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  Dialog,
  Select,
  Sheet,
  Skeleton,
  StatusIcon,
} from "@/components/ui";
import { CloudBackdrop } from "@/features/cloud/components/cloud-backdrop";
import { OwnOrbBar } from "@/features/cloud/components/own-orb-bar";
import { ProfileCardSheet } from "@/features/cloud/components/profile-card-sheet";
import { SkyOrb } from "@/features/cloud/components/sky-orb";
import {
  canCallFromCloud,
  type CloudEntry,
  type CloudFilters,
  type CloudViewMode,
  CURATED_INTEREST_IDS,
  type CuratedInterestId,
  EMPTY_CLOUD_FILTERS,
  filterCloudEntries,
  layoutSkyOrbs,
  MAX_LIST_PAGE_SIZE,
  MAX_SKY_ORBS,
  type PresenceStateValue,
  type PresenceStatus,
  type ProfileCardData,
  rankQuickMatchCandidates,
  resolveDefaultCloudView,
  type UserIntent,
} from "@/lib/cloud";
import { getStatusMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SUPPORTED_COUNTRY_FILTER_CODES = ["NG", "GH", "FR", "GB", "US"] as const;

export type CloudScreenDataState =
  | "ready"
  | "loading"
  | "empty"
  | "error"
  | "open_elsewhere"
  | "quick_match_empty";

export interface CloudViewerSummary {
  readonly display_name?: string;
  readonly avatar_id:
    | "avatar_01"
    | "avatar_02"
    | "avatar_03"
    | "avatar_04"
    | "avatar_05"
    | "avatar_06"
    | "avatar_07"
    | "avatar_08";
  readonly languages: readonly string[];
  readonly interests: readonly CuratedInterestId[];
}

const DEFAULT_VIEWER: CloudViewerSummary = {
  avatar_id: "avatar_02",
  languages: ["en"],
  interests: [],
};

export interface CloudScreenProps {
  readonly entries?: readonly CloudEntry[];
  readonly profileCards?: Readonly<Record<string, ProfileCardData>>;
  readonly viewer?: CloudViewerSummary;
  readonly openCount?: number;
  readonly initialPresenceState?: PresenceStateValue;
  readonly initialStatus?: PresenceStatus;
  readonly initialViewMode?: CloudViewMode;
  readonly initialSelectedUserId?: string | null;
  readonly initialStatusPickerOpen?: boolean;
  readonly initialFilters?: CloudFilters;
  readonly dataState?: CloudScreenDataState;
  readonly reducedMotionOverride?: boolean;
  readonly longCopy?: boolean;
  readonly embedded?: boolean;
}

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function CloudScreen({
  entries = [],
  profileCards = {},
  viewer = DEFAULT_VIEWER,
  openCount,
  initialPresenceState = "closed",
  initialStatus = { preset: "just_chat", custom: null },
  initialViewMode,
  initialSelectedUserId = null,
  initialStatusPickerOpen = false,
  initialFilters = EMPTY_CLOUD_FILTERS,
  dataState = "ready",
  reducedMotionOverride,
  longCopy = false,
  embedded = false,
}: CloudScreenProps) {
  const tCloud = useTranslations("cloud");
  const tCommon = useTranslations("common");
  const tLang = useTranslations("languages");
  const tInterests = useTranslations("interests");
  const tIntents = useTranslations("intents");
  const tStatus = useTranslations("statusPresets");

  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const effectiveReducedMotion =
    reducedMotionOverride !== undefined
      ? reducedMotionOverride
      : prefersReducedMotion;

  const [userViewMode, setViewMode] = React.useState<CloudViewMode | null>(
    initialViewMode ?? null,
  );
  const viewMode: CloudViewMode =
    userViewMode ??
    resolveDefaultCloudView({ prefersReducedMotion: effectiveReducedMotion });

  const [presenceState, setPresenceState] =
    React.useState<PresenceStateValue>(initialPresenceState);
  const [ownStatus, setOwnStatus] =
    React.useState<PresenceStatus>(initialStatus);
  const [filters, setFilters] = React.useState<CloudFilters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    initialSelectedUserId,
  );
  const [statusPickerOpen, setStatusPickerOpen] = React.useState<boolean>(
    initialStatusPickerOpen,
  );
  const [pageIndex, setPageIndex] = React.useState(0);
  const [takeOverDialogOpen, setTakeOverDialogOpen] = React.useState(
    dataState === "open_elsewhere",
  );
  const [quickMatchBanner, setQuickMatchBanner] = React.useState<
    "none" | "no_one_available" | "matched"
  >(dataState === "quick_match_empty" ? "no_one_available" : "none");

  const stretch = React.useCallback(
    (text: string) => {
      if (!longCopy) return text;
      const pad = text.slice(0, Math.max(6, Math.ceil(text.length * 0.4)));
      return `${text} (${pad})`;
    },
    [longCopy],
  );

  const activeEntries = React.useMemo(
    () => (dataState === "empty" ? [] : entries),
    [dataState, entries],
  );

  const filteredEntries = React.useMemo(
    () => filterCloudEntries(activeEntries, filters),
    [activeEntries, filters],
  );

  const trueOpenCount =
    dataState === "empty" ? 0 : (openCount ?? activeEntries.length);

  const pageSize = viewMode === "sky" ? MAX_SKY_ORBS : MAX_LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);

  const pageEntries = React.useMemo(
    () =>
      filteredEntries.slice(
        safePageIndex * pageSize,
        (safePageIndex + 1) * pageSize,
      ),
    [filteredEntries, safePageIndex, pageSize],
  );

  const orbPlacements = React.useMemo(
    () =>
      layoutSkyOrbs(pageEntries, {
        reducedMotion: effectiveReducedMotion,
        maxOrbs: MAX_SKY_ORBS,
      }),
    [pageEntries, effectiveReducedMotion],
  );

  const selectedProfile: ProfileCardData | null = React.useMemo(() => {
    if (!selectedUserId) return null;
    const fromMap = profileCards[selectedUserId];
    if (fromMap) return fromMap;
    const found = activeEntries.find((item) => item.user_id === selectedUserId);
    if (!found) return null;
    return { ...found, photo_url: null };
  }, [selectedUserId, profileCards, activeEntries]);

  const callGate = canCallFromCloud(presenceState);

  const activeFilterCount =
    (filters.language ? 1 : 0) +
    (filters.country ? 1 : 0) +
    (filters.intent ? 1 : 0) +
    filters.interests.length;

  const toggleInterestFilter = (interest: CuratedInterestId) => {
    setPageIndex(0);
    setFilters((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((id) => id !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const resetFilters = () => {
    setPageIndex(0);
    setFilters(EMPTY_CLOUD_FILTERS);
  };

  const handleQuickMatch = () => {
    if (!callGate.allowed) return;
    const ranked = rankQuickMatchCandidates(filteredEntries, {
      languages: viewer.languages,
      interests: viewer.interests,
      filterLanguage: filters.language,
      filterCountry: filters.country,
    });
    if (ranked.length === 0) {
      setQuickMatchBanner("no_one_available");
      return;
    }
    setQuickMatchBanner("matched");
    setSelectedUserId(ranked[0]!.user_id);
  };

  const languageFilterOptions = React.useMemo(
    () => [
      { value: "", label: tCloud("filters.allLanguages") },
      { value: "en", label: tLang("en") },
      { value: "pcm", label: tLang("pcm") },
      { value: "yo", label: tLang("yo") },
      { value: "ha", label: tLang("ha") },
      { value: "ig", label: tLang("ig") },
      { value: "fr", label: tLang("fr") },
    ],
    [tCloud, tLang],
  );

  const countryFilterOptions = React.useMemo(
    () => [
      { value: "", label: tCloud("filters.allCountries") },
      ...SUPPORTED_COUNTRY_FILTER_CODES.map((code) => ({
        value: code,
        label: tCloud(`countries.${code}`),
      })),
    ],
    [tCloud],
  );

  const intentFilterOptions = React.useMemo(
    () => [
      { value: "", label: tCloud("filters.allIntents") },
      { value: "want_to_talk", label: tIntents("want_to_talk") },
      { value: "happy_to_listen", label: tIntents("happy_to_listen") },
    ],
    [tCloud, tIntents],
  );

  const formatEntryStatus = (entry: CloudEntry): string => {
    if (entry.status?.custom) return entry.status.custom;
    if (entry.status?.preset) return tStatus(entry.status.preset);
    return tStatus("just_chat");
  };

  const formatEntryLanguages = (entry: CloudEntry): string =>
    entry.languages.map((code) => tLang(code)).join(" · ");

  const populationLine =
    trueOpenCount === 0
      ? tCloud("populationZero")
      : trueOpenCount === 1
        ? tCloud("populationOne")
        : tCloud("populationMany", { count: trueOpenCount });

  return (
    <AppShell
      inlinePreview={embedded}
      fullBleed
      surface="cloud"
      activeTab="cloud"
    >
      <div
        className={cn(
          "relative flex w-full flex-1 flex-col overflow-hidden",
          embedded ? "min-h-[36rem]" : "min-h-[calc(100dvh-4rem)]",
        )}
      >
        {/* Full-bleed living cloud & sky backdrop (Spec 9.2) */}
        <CloudBackdrop />

        {/* Floating airy sky layer: minimal top bar, open cloud space, bottom-centre Open to talk card */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          {/* Top floating controls: calm population pill + subtle Find someone, Filter sheet trigger, Sky/List toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line/70 bg-surface/75 px-3.5 py-2 shadow-[var(--shadow-card)] backdrop-blur-md">
              <span
                aria-hidden="true"
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  trueOpenCount > 0 ? "bg-good" : "bg-ink-muted",
                )}
              />
              <p
                role="status"
                aria-live="polite"
                className="text-sm font-semibold text-ink break-words"
              >
                {stretch(populationLine)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                disabled={!callGate.allowed || trueOpenCount === 0}
                onClick={handleQuickMatch}
                className="rounded-[var(--radius-pill)] shadow-[var(--shadow-card)]"
              >
                {stretch(tCloud("findSomeoneButton"))}
              </Button>

              {/* Filters live in a calm Sheet instead of cluttering the cloud sky (FR-CLOUD-4) */}
              <Button
                variant={activeFilterCount > 0 ? "primary" : "secondary"}
                aria-haspopup="dialog"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen(true)}
                className="rounded-[var(--radius-pill)] bg-surface/80 backdrop-blur-md"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.5 5h13M6 10h8M8.5 15h3"
                  />
                </svg>
                <span>
                  {stretch(
                    activeFilterCount > 0
                      ? tCloud("filters.openButtonWithCount", {
                          count: activeFilterCount,
                        })
                      : tCloud("filters.openButton"),
                  )}
                </span>
              </Button>

              <div
                role="group"
                aria-label={tCloud("viewToggleLabel")}
                className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-line/70 bg-surface/75 p-1 backdrop-blur-md"
              >
                <Chip
                  selected={viewMode === "sky"}
                  onClick={() => setViewMode("sky")}
                >
                  {stretch(tCloud("skyViewTab"))}
                </Chip>
                <Chip
                  selected={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                >
                  {stretch(tCloud("listViewTab"))}
                </Chip>
              </div>
            </div>
          </div>

          {/* Quick match & error banners */}
          {quickMatchBanner === "no_one_available" ? (
            <div className="mx-auto w-full max-w-xl">
              <Banner
                tone="info"
                title={stretch(tCloud("quickMatchEmptyTitle"))}
                description={stretch(tCloud("quickMatchEmptyBody"))}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setQuickMatchBanner("none")}
                  >
                    {tCommon("close")}
                  </Button>
                }
              />
            </div>
          ) : null}

          {dataState === "error" ? (
            <div className="mx-auto w-full max-w-xl">
              <Banner
                tone="danger"
                title={stretch(tCloud("errorTitle"))}
                description={stretch(tCloud("errorBody"))}
                action={
                  <Button variant="secondary">{tCommon("retry")}</Button>
                }
              />
            </div>
          ) : null}

          {/* Living open cloud space (center viewport) */}
          <div className="relative flex flex-1 flex-col justify-center">
            {dataState === "loading" ? (
              <div className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-[var(--radius-card)] bg-surface/70 p-6 backdrop-blur-md">
                <Skeleton label={tCloud("loadingSkyLabel")} className="h-12 w-full" />
                <Skeleton label={tCloud("loadingSkyLabel")} className="h-12 w-5/6" />
                <Skeleton label={tCloud("loadingSkyLabel")} className="h-12 w-4/6" />
              </div>
            ) : trueOpenCount === 0 ? (
              /* Whisper-light empty cloud floating directly in the open sky (Spec 9.7) */
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-xl font-semibold text-ink sm:text-2xl break-words">
                  {stretch(tCloud("emptyTitle"))}
                </p>
                <p className="text-sm leading-relaxed text-ink-secondary break-words">
                  {stretch(tCloud("emptyBody"))}
                </p>
                {presenceState !== "open" ? (
                  <Button
                    variant="primary"
                    onClick={() => setPresenceState("open")}
                    className="mt-2 rounded-[var(--radius-pill)]"
                  >
                    {stretch(tCloud("turnOnOpenToTalk"))}
                  </Button>
                ) : null}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line/70 bg-surface/75 px-6 py-8 text-center backdrop-blur-md">
                <p className="text-lg font-semibold text-ink break-words">
                  {stretch(tCloud("filteredEmptyTitle"))}
                </p>
                <p className="text-sm text-ink-secondary break-words">
                  {stretch(tCloud("filteredEmptyBody"))}
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  {stretch(tCloud("filters.clearAll"))}
                </Button>
              </div>
            ) : viewMode === "sky" ? (
              /* Living Sky View: open people floating freely across the full cloud canvas (Spec 9.2) */
              <section
                aria-label={tCloud("skyRegionLabel")}
                className="relative min-h-[26rem] w-full flex-1 sm:min-h-[30rem]"
              >
                {orbPlacements.map((placement) => {
                  const statusText = formatEntryStatus(placement.entry);
                  const langsText = formatEntryLanguages(placement.entry);
                  return (
                    <SkyOrb
                      key={placement.entry.user_id}
                      placement={placement}
                      statusLabel={stretch(statusText)}
                      languagesLabel={langsText}
                      ariaLabel={tCloud("orbAriaLabel", {
                        name: placement.entry.display_name,
                        status: statusText,
                        languages: langsText,
                      })}
                      selected={selectedUserId === placement.entry.user_id}
                      onSelect={(id) => setSelectedUserId(id)}
                    />
                  );
                })}
              </section>
            ) : (
              /* Accessible List View floating cleanly over the cloud sky (Spec 9.3, FR-CLOUD-6) */
              <section
                aria-label={tCloud("listRegionLabel")}
                className="flex flex-col gap-3 py-2"
              >
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pageEntries.map((entry) => {
                    const presetKey = entry.status?.preset ?? "custom";
                    const statusMeta = getStatusMeta(presetKey);
                    const statusText = formatEntryStatus(entry);
                    const isSelected = selectedUserId === entry.user_id;

                    return (
                      <li key={entry.user_id}>
                        <Card
                          className={cn(
                            "flex h-full flex-col justify-between gap-4 bg-surface/85 backdrop-blur-md transition-colors duration-[var(--duration-fast)]",
                            isSelected && "ring-2 ring-accent",
                          )}
                        >
                          <div className="flex items-start gap-3.5">
                            <Avatar
                              presetId={entry.avatar_id}
                              allowPhoto={false}
                              size="lg"
                              statusPreset={presetKey}
                              label={entry.display_name}
                            />
                            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-ink break-words">
                                  {entry.display_name}
                                </h3>
                                {entry.country ? (
                                  <span className="rounded-[var(--radius-sm)] bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-secondary">
                                    {tCloud.has(`countries.${entry.country}`)
                                      ? tCloud(`countries.${entry.country}`)
                                      : entry.country}
                                  </span>
                                ) : null}
                              </div>

                              <div
                                className={cn(
                                  "inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-semibold",
                                  statusMeta.bgClass,
                                  statusMeta.borderClass,
                                  statusMeta.textClass,
                                )}
                              >
                                <StatusIcon
                                  icon={statusMeta.icon}
                                  className="h-3.5 w-3.5"
                                />
                                <span className="break-words">
                                  {stretch(statusText)}
                                </span>
                              </div>

                              <p className="text-xs font-medium text-ink-secondary break-words">
                                {formatEntryLanguages(entry)}
                                {entry.intent
                                  ? ` · ${tIntents(entry.intent)}`
                                  : ""}
                              </p>

                              {entry.interests.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {entry.interests.map((id) => (
                                    <span
                                      key={id}
                                      className="rounded-[var(--radius-sm)] border border-line bg-surface-sunken px-2 py-0.5 text-xs text-ink-secondary"
                                    >
                                      {stretch(tInterests(id))}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                            <Button
                              variant="secondary"
                              onClick={() => setSelectedUserId(entry.user_id)}
                            >
                              {stretch(
                                tCloud("viewProfileButton", {
                                  name: entry.display_name,
                                }),
                              )}
                            </Button>
                            <Button
                              variant="primary"
                              disabled={!callGate.allowed}
                              onClick={() => setSelectedUserId(entry.user_id)}
                            >
                              {stretch(
                                tCloud("profileCard.callButton", {
                                  name: entry.display_name,
                                }),
                              )}
                            </Button>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* Pagination bar only when open users exceed a single sky/list page */}
          {filteredEntries.length > pageSize ? (
            <div className="mx-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-3 rounded-[var(--radius-pill)] border border-line/70 bg-surface/80 px-4 py-2 backdrop-blur-md">
              <span className="text-xs font-medium text-ink-secondary">
                {tCloud("paginationRange", {
                  start: safePageIndex * pageSize + 1,
                  end: Math.min(
                    (safePageIndex + 1) * pageSize,
                    filteredEntries.length,
                  ),
                  total: filteredEntries.length,
                })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={safePageIndex === 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  {tCloud("paginationPrev")}
                </Button>
                <Button
                  variant="secondary"
                  disabled={safePageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                  }
                >
                  {tCloud("paginationNext")}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Hero focal point: user's own orb & Open to talk card anchored at the bottom centre of the clouds */}
          <OwnOrbBar
            viewerName={
              viewer.display_name ?? tCloud("ownOrb.defaultViewerName")
            }
            viewerAvatarId={viewer.avatar_id}
            isOpen={presenceState === "open"}
            status={ownStatus}
            onToggleOpen={(next) => setPresenceState(next ? "open" : "closed")}
            onChangeStatus={setOwnStatus}
            statusPickerOpen={statusPickerOpen}
            onStatusPickerOpenChange={setStatusPickerOpen}
            inlineSheet={embedded}
            stretch={stretch}
          />
        </div>

        {/* Filters Sheet opened on demand so the cloud sky stays uncluttered (FR-CLOUD-4) */}
        <Sheet
          open={filtersOpen}
          inline={embedded}
          onClose={() => setFiltersOpen(false)}
          title={stretch(tCloud("filters.heading"))}
          description={stretch(tCloud("filters.sheetDescription"))}
          closeLabel={tCommon("close")}
        >
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                label={stretch(tCloud("filters.languageLabel"))}
                options={languageFilterOptions}
                value={filters.language ?? ""}
                onChange={(e) => {
                  setPageIndex(0);
                  setFilters((prev) => ({
                    ...prev,
                    language: e.target.value || null,
                  }));
                }}
              />
              <Select
                label={stretch(tCloud("filters.countryLabel"))}
                options={countryFilterOptions}
                value={filters.country ?? ""}
                onChange={(e) => {
                  setPageIndex(0);
                  setFilters((prev) => ({
                    ...prev,
                    country: e.target.value || null,
                  }));
                }}
              />
              <Select
                label={stretch(tCloud("filters.intentLabel"))}
                options={intentFilterOptions}
                value={filters.intent ?? ""}
                onChange={(e) => {
                  setPageIndex(0);
                  setFilters((prev) => ({
                    ...prev,
                    intent: (e.target.value || null) as UserIntent | null,
                  }));
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-ink-secondary">
                {stretch(tCloud("filters.interestsLabel"))}
              </span>
              <div className="flex flex-wrap gap-2">
                {CURATED_INTEREST_IDS.map((interestId) => (
                  <Chip
                    key={interestId}
                    selected={filters.interests.includes(interestId)}
                    onClick={() => toggleInterestFilter(interestId)}
                  >
                    {stretch(tInterests(interestId))}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              {activeFilterCount > 0 ? (
                <Button variant="quiet" onClick={resetFilters}>
                  {stretch(tCloud("filters.clearAll"))}
                </Button>
              ) : (
                <span />
              )}
              <Button variant="primary" onClick={() => setFiltersOpen(false)}>
                {stretch(tCloud("filters.applyButton"))}
              </Button>
            </div>
          </div>
        </Sheet>

        {/* Selected person's Profile Card Sheet (Spec 9.2, FR-PROF-6, FR-CLOUD-7) */}
        <ProfileCardSheet
          profile={selectedProfile}
          open={Boolean(selectedProfile)}
          onClose={() => setSelectedUserId(null)}
          presenceState={presenceState}
          onRequestOpenToTalk={() => setPresenceState("open")}
          inline={embedded}
          stretch={stretch}
        />

        {/* 409 presence.open_elsewhere take-over confirmation Dialog (API #20, FR-AUTH-5) */}
        <Dialog
          open={takeOverDialogOpen}
          inline={embedded}
          onClose={() => setTakeOverDialogOpen(false)}
          title={stretch(tCloud("takeOverDialog.title"))}
          description={stretch(tCloud("takeOverDialog.description"))}
          closeLabel={tCommon("close")}
          footer={
            <>
              <Button
                variant="quiet"
                onClick={() => setTakeOverDialogOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setPresenceState("open");
                  setTakeOverDialogOpen(false);
                }}
              >
                {stretch(tCloud("takeOverDialog.confirm"))}
              </Button>
            </>
          }
        >
          <p className="text-sm text-ink-secondary">
            {stretch(tCloud("takeOverDialog.body"))}
          </p>
        </Dialog>
      </div>
    </AppShell>
  );
}
