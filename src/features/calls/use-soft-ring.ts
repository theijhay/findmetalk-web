"use client";

import * as React from "react";

interface WindowWithWebkitAudio {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Plays a soft, non-startling incoming chime using Web Audio when active and
 * unmuted (Spec 9.6). Fails silently if autoplay is blocked or AudioContext is
 * unavailable on older mobile browsers.
 */
export function useSoftRing(options: {
  readonly active: boolean;
  readonly muted: boolean;
  readonly enabled?: boolean;
}): void {
  const { active, muted, enabled = true } = options;

  React.useEffect(() => {
    if (!active || muted || !enabled || typeof window === "undefined") {
      return;
    }

    const win = window as unknown as WindowWithWebkitAudio;
    const AudioCtx = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioCtx();
    } catch {
      return;
    }

    const playChime = () => {
      if (!ctx || ctx.state === "closed") return;
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const notes = [440, 554.37];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.22);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.035, now + idx * 0.22 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.22);
        osc.stop(now + idx * 0.22 + 0.6);
      });
    };

    playChime();
    const timer = window.setInterval(playChime, 3200);

    return () => {
      window.clearInterval(timer);
      if (ctx && ctx.state !== "closed") {
        void ctx.close().catch(() => {});
      }
    };
  }, [active, muted, enabled]);
}
