import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import {
  APPEARANCE_BOOTSTRAP_SCRIPT,
  contrastRatio,
  getDefaultThemeForPeriod,
  getSkyPeriod,
  getStatusMeta,
  isThemePreference,
  resolveAppearance,
  SKY_PERIODS,
  STATUS_META,
  STATUS_PRESET_IDS,
} from "../src/lib/theme.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = path.join(ROOT, "src");
const GLOBALS_CSS = readFileSync(path.join(SRC, "app/globals.css"), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory()
      ? sourceFiles(full)
      : /\.(ts|tsx|css)$/.test(name)
        ? [full]
        : [];
  });
}

function parsePaletteBlock(selectorMarker: string): Record<string, string> {
  const idx = GLOBALS_CSS.indexOf(selectorMarker);
  assert.ok(idx !== -1, `Missing palette block: ${selectorMarker}`);
  const openBrace = GLOBALS_CSS.indexOf("{", idx);
  const closeBrace = GLOBALS_CSS.indexOf("}", openBrace);
  const body = GLOBALS_CSS.slice(openBrace + 1, closeBrace);
  const tokens: Record<string, string> = {};
  for (const match of body.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2]?.trim();
    if (name && value && name !== "--color-*") {
      tokens[name] = value;
    }
  }
  return tokens;
}

test("Spec 9.2: getSkyPeriod maps every local hour to dawn, day, dusk or night", () => {
  assert.equal(getSkyPeriod(0), "night");
  assert.equal(getSkyPeriod(2), "night");
  assert.equal(getSkyPeriod(4), "night");
  assert.equal(getSkyPeriod(5), "dawn");
  assert.equal(getSkyPeriod(7), "dawn");
  assert.equal(getSkyPeriod(8), "day");
  assert.equal(getSkyPeriod(12), "day");
  assert.equal(getSkyPeriod(16), "day");
  assert.equal(getSkyPeriod(17), "dusk");
  assert.equal(getSkyPeriod(19), "dusk");
  assert.equal(getSkyPeriod(20), "night");
  assert.equal(getSkyPeriod(23), "night");
});

test("Spec 9.6: theme defaults to light by day/dawn and dark by night/dusk, with user override", () => {
  assert.equal(getDefaultThemeForPeriod("dawn"), "light");
  assert.equal(getDefaultThemeForPeriod("day"), "light");
  assert.equal(getDefaultThemeForPeriod("dusk"), "dark");
  assert.equal(getDefaultThemeForPeriod("night"), "dark");

  assert.deepEqual(resolveAppearance("auto", 6), { theme: "light", sky: "dawn" });
  assert.deepEqual(resolveAppearance("auto", 14), { theme: "light", sky: "day" });
  assert.deepEqual(resolveAppearance("auto", 18), { theme: "dark", sky: "dusk" });
  assert.deepEqual(resolveAppearance("auto", 2), { theme: "dark", sky: "night" });

  // User override to dark during daytime or light during nighttime
  assert.deepEqual(resolveAppearance("dark", 14), { theme: "dark", sky: "night" });
  assert.deepEqual(resolveAppearance("light", 2), { theme: "light", sky: "day" });
});

test("Spec 9.2, 9.4: every status preset has a colour token and a distinct icon", () => {
  const icons = new Set<string>();
  for (const id of [...STATUS_PRESET_IDS, "custom"] as const) {
    const meta = getStatusMeta(id);
    assert.equal(meta.id, id);
    assert.match(meta.colorToken, /^--color-status-/);
    assert.ok(meta.icon.length > 0);
    icons.add(meta.icon);
  }
  assert.equal(icons.size, STATUS_PRESET_IDS.length + 1);
  assert.equal(getStatusMeta("unknown_preset").id, "custom");
});

test("Spec 9.1: every colour token in globals.css is a plain 6-digit hex for iOS 15 fallback", () => {
  const declarations = [...GLOBALS_CSS.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)];
  assert.ok(declarations.length > 0);
  for (const [, prop, val] of declarations) {
    if (prop === "--color-*") continue;
    assert.match(
      val!.trim(),
      /^#[0-9a-f]{6}$/i,
      `${prop} must be a plain 6-digit hex colour, got ${val}`,
    );
  }
});

test("Spec 9.1: no raw colour values exist outside globals.css (and browser metadata files)", () => {
  const allowed = new Set([
    path.join(SRC, "app/globals.css"),
    path.join(SRC, "app/layout.tsx"),
    path.join(SRC, "app/manifest.ts"),
  ]);
  const offenders: string[] = [];
  for (const file of sourceFiles(SRC)) {
    if (allowed.has(file)) continue;
    const content = readFileSync(file, "utf8");
    if (/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\s*\(/.test(content)) {
      offenders.push(path.relative(ROOT, file));
    }
  }
  assert.deepEqual(offenders, []);
});

test("WCAG 2.2 AA: every dawn, day, dusk and night token pair meets contrast requirements", () => {
  for (const period of SKY_PERIODS) {
    const tokens = parsePaletteBlock(`[data-palette="${period}"]`);
    const backgrounds = [
      tokens["--color-page"],
      tokens["--color-surface"],
      tokens["--color-surface-raised"],
      tokens["--color-surface-sunken"],
    ];
    for (const bg of backgrounds) {
      assert.ok(bg, `Missing background in ${period}`);
    }

    const textTokens = [
      "--color-ink",
      "--color-ink-secondary",
      "--color-ink-muted",
      "--color-accent",
      "--color-good",
      "--color-caution",
      "--color-danger",
      "--color-help",
      ...Object.values(STATUS_META).map((m) => m.colorToken),
    ];

    for (const fgName of textTokens) {
      const fg = tokens[fgName];
      assert.ok(fg, `Missing ${fgName} in ${period}`);
      for (const bg of backgrounds) {
        const ratio = contrastRatio(fg, bg!);
        assert.ok(
          ratio >= 4.5,
          `${period} ${fgName} (${fg}) on ${bg} has contrast ${ratio.toFixed(2)}:1 (< 4.5:1)`,
        );
      }
    }

    // Filled button / badge foreground-on-background pairs
    const filledPairs: ReadonlyArray<readonly [string, string]> = [
      ["--color-on-accent", "--color-accent"],
      ["--color-on-good", "--color-good"],
      ["--color-on-caution", "--color-caution"],
      ["--color-on-danger", "--color-danger"],
      ["--color-on-help", "--color-help"],
    ];
    for (const [fgName, bgName] of filledPairs) {
      const ratio = contrastRatio(tokens[fgName]!, tokens[bgName]!);
      assert.ok(
        ratio >= 4.5,
        `${period} ${fgName} on ${bgName} has contrast ${ratio.toFixed(2)}:1 (< 4.5:1)`,
      );
    }

    // Non-text control border contrast >= 3:1
    const borderRatioPage = contrastRatio(tokens["--color-line-strong"]!, tokens["--color-page"]!);
    const borderRatioSurface = contrastRatio(
      tokens["--color-line-strong"]!,
      tokens["--color-surface"]!,
    );
    assert.ok(borderRatioPage >= 3, `${period} line-strong on page < 3:1`);
    assert.ok(borderRatioSurface >= 3, `${period} line-strong on surface < 3:1`);
  }
});

test("Spec 9.6: self-hosted typeface contains every Yoruba, Hausa, Igbo and French glyph", () => {
  const require = createRequire(import.meta.url);
  const fontkitMod = require("../node_modules/next/dist/compiled/@next/font/dist/fontkit").default;
  const fontFromBuffer = fontkitMod.default ?? fontkitMod;
  const fontBuffer = readFileSync(path.join(SRC, "app/fonts/NotoSans-Variable.woff2"));
  const font = fontFromBuffer(fontBuffer) as {
    hasGlyphForCodePoint: (cp: number) => boolean;
  };

  const requiredCharacters = [
    // Yoruba special characters and tone marks
    ..."ẹọṣẸỌṢáàéèíìóòúùńǹ\u0300\u0301\u0323\u0304",
    // Hausa hooked letters
    ..."ɓɗƙƴƁƊƘƳ",
    // Igbo vowels and overdot n
    ..."ịọụṅỊỌỤṄ",
    // French diacritics and ligatures
    ..."éèêëàâçîïôùûüœæÉÈÊËÀÂÇÎÏÔÙÛÜŒÆ",
  ];

  const missing = requiredCharacters.filter(
    (ch) => !font.hasGlyphForCodePoint(ch.codePointAt(0)!),
  );
  assert.deepEqual(missing, []);

  // Font license and provenance must accompany the self-hosted font
  const ofl = readFileSync(path.join(SRC, "app/fonts/OFL.txt"), "utf8");
  const fontReadme = readFileSync(path.join(SRC, "app/fonts/README.md"), "utf8");
  assert.ok(ofl.includes("SIL OPEN FONT LICENSE Version 1.1"));
  assert.ok(fontReadme.includes("NotoSans-Variable.woff2"));
  assert.ok(fontReadme.includes("0aaad2682589cad9f21b1e9e100262efab372ac8a4f69d83f9d743768c1973c0"));
});

test("Spec 9.2, 9.6: pre-paint bootstrap script matches resolveAppearance and getSkyPeriod across every hour and preference", () => {
  assert.equal(APPEARANCE_BOOTSTRAP_SCRIPT.includes("?."), false);

  const storageCases: ReadonlyArray<{
    label: string;
    getItem: (key: string) => string | null;
    expectedPref: "auto" | "light" | "dark";
  }> = [
    { label: "auto", getItem: () => "auto", expectedPref: "auto" },
    { label: "light", getItem: () => "light", expectedPref: "light" },
    { label: "dark", getItem: () => "dark", expectedPref: "dark" },
    { label: "missing", getItem: () => null, expectedPref: "auto" },
    { label: "invalid", getItem: () => "unexpected", expectedPref: "auto" },
    {
      label: "throwing localStorage",
      getItem: () => {
        throw new Error("SecurityError: storage disabled");
      },
      expectedPref: "auto",
    },
  ];

  for (let hour = 0; hour < 24; hour += 1) {
    for (const storageCase of storageCases) {
      const attrs: Record<string, string> = {};
      const document = {
        documentElement: {
          setAttribute: (name: string, value: string) => {
            attrs[name] = value;
          },
        },
      };
      const window = {
        localStorage: {
          getItem: storageCase.getItem,
        },
      };
      class FakeDate {
        getHours(): number {
          return hour;
        }
      }

      vm.runInNewContext(APPEARANCE_BOOTSTRAP_SCRIPT, {
        window,
        document,
        Date: FakeDate,
      });

      const expected = resolveAppearance(
        isThemePreference(storageCase.expectedPref) ? storageCase.expectedPref : "auto",
        hour,
      );
      if (storageCase.expectedPref === "auto") {
        assert.equal(expected.sky, getSkyPeriod(hour));
      }
      assert.equal(
        attrs["data-theme"],
        expected.theme,
        `hour=${hour} (${storageCase.label}): expected data-theme=${expected.theme}, got ${attrs["data-theme"]}`,
      );
      assert.equal(
        attrs["data-sky"],
        expected.sky,
        `hour=${hour} (${storageCase.label}): expected data-sky=${expected.sky}, got ${attrs["data-sky"]}`,
      );
    }
  }
});
