"use client";

import * as React from "react";

import { isWakeLockSupported } from "@/lib/calls";

export type WakeLockStatus = "idle" | "active" | "unsupported";

interface ScreenWakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
}

interface NavigatorWithWakeLock {
  readonly wakeLock?: {
    request: (type: "screen") => Promise<ScreenWakeLockSentinel>;
  };
}

/**
 * Keeps the screen awake during active calls where the Screen Wake Lock API is
 * supported (Spec 9.6). Degrades silently on iOS 15.4 and unsupported browsers.
 */
export function useWakeLock(active: boolean): WakeLockStatus {
  const [acquired, setAcquired] = React.useState(false);

  const supported =
    typeof navigator !== "undefined" &&
    isWakeLockSupported(navigator as NavigatorWithWakeLock);

  React.useEffect(() => {
    if (!supported || !active || typeof navigator === "undefined") {
      return;
    }

    const nav = navigator as NavigatorWithWakeLock;
    let cancelled = false;
    let sentinel: ScreenWakeLockSentinel | null = null;

    const acquire = async () => {
      try {
        const next = await nav.wakeLock!.request("screen");
        if (cancelled) {
          await next.release().catch(() => {});
          return;
        }
        sentinel = next;
        setAcquired(true);
      } catch {
        if (!cancelled) {
          setAcquired(false);
        }
      }
    };

    void acquire();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        void acquire();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (sentinel && !sentinel.released) {
        void sentinel.release().catch(() => {});
      }
    };
  }, [active, supported]);

  if (!supported) return "unsupported";
  if (!active) return "idle";
  return acquired ? "active" : "idle";
}
