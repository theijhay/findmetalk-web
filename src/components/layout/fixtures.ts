import type { ShellBannerState, ShellSurface } from "@/lib/navigation";

export interface ShellScenarioFixture {
  readonly id: string;
  readonly surface: ShellSurface;
  readonly bannerState: ShellBannerState;
}

export const SHELL_SCENARIO_FIXTURES: readonly ShellScenarioFixture[] = [
  { id: "cloud_normal", surface: "cloud", bannerState: "normal" },
  { id: "recents_normal", surface: "recents", bannerState: "normal" },
  { id: "settings_normal", surface: "settings", bannerState: "normal" },
  { id: "call_active", surface: "call", bannerState: "normal" },
  { id: "circle_active", surface: "circle", bannerState: "normal" },
  { id: "cloud_offline", surface: "cloud", bannerState: "offline" },
  { id: "call_reconnecting", surface: "call", bannerState: "reconnecting" },
  { id: "cloud_error", surface: "cloud", bannerState: "error" },
] as const;
