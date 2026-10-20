"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import {
  APPEARANCE_PREFERENCE_KEY,
  isThemePreference,
  resolveAppearance,
  type SkyPeriod,
  type ThemeMode,
  type ThemePreference,
} from "@/lib/theme";

const PREFERENCE_KEY = APPEARANCE_PREFERENCE_KEY;
const PREFERENCE_EVENT = "fmt-appearance-change";

export interface AppearanceContextValue {
  readonly preference: ThemePreference;
  readonly theme: ThemeMode;
  readonly sky: SkyPeriod;
  readonly localHour: number;
  readonly setPreference: (next: ThemePreference) => void;
  readonly setSimulatedHour: (hour: number | null) => void;
}

const AppearanceContext = React.createContext<AppearanceContextValue | null>(null);

export function useAppearance(): AppearanceContextValue {
  const ctx = React.useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used inside Providers");
  }
  return ctx;
}

function subscribePreference(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PREFERENCE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PREFERENCE_EVENT, onStoreChange);
  };
}

function getPreferenceSnapshot(): ThemePreference {
  try {
    const saved = window.localStorage.getItem(PREFERENCE_KEY);
    if (isThemePreference(saved)) return saved;
  } catch {
    // Storage may be unavailable in restricted browsing modes.
  }
  return "auto";
}

function getServerPreferenceSnapshot(): ThemePreference {
  return "auto";
}

function subscribeClockHour(onStoreChange: () => void): () => void {
  const timer = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(timer);
}

function getClockHourSnapshot(): number {
  return new Date().getHours();
}

function getServerClockHourSnapshot(): number {
  return 12;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              const status = (error as { status?: number } | null)?.status;
              if (status === 401 || status === 403 || status === 404) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  const preference = React.useSyncExternalStore(
    subscribePreference,
    getPreferenceSnapshot,
    getServerPreferenceSnapshot,
  );
  const clockHour = React.useSyncExternalStore(
    subscribeClockHour,
    getClockHourSnapshot,
    getServerClockHourSnapshot,
  );
  const [simulatedHour, setSimulatedHour] = React.useState<number | null>(null);

  const setPreference = React.useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(PREFERENCE_KEY, next);
      window.dispatchEvent(new Event(PREFERENCE_EVENT));
    } catch {
      // Ignore storage write failures.
    }
  }, []);

  const effectiveHour = simulatedHour ?? clockHour;
  const { theme, sky } = resolveAppearance(preference, effectiveHour);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-sky", sky);
  }, [theme, sky]);

  const value = React.useMemo<AppearanceContextValue>(
    () => ({
      preference,
      theme,
      sky,
      localHour: effectiveHour,
      setPreference,
      setSimulatedHour,
    }),
    [preference, theme, sky, effectiveHour, setPreference],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
    </QueryClientProvider>
  );
}
