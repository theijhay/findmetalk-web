import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { LOCALES, mergeMessages, pickLocale } from "../src/i18n/locales.ts";

type Messages = { [key: string]: string | Messages };

function load(locale: string): Messages {
  return JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")) as Messages;
}

function keys(messages: Messages, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : keys(value, `${prefix}${key}.`),
  );
}

test("every UI language has a messages file", () => {
  for (const locale of LOCALES) assert.doesNotThrow(() => load(locale), locale);
});

test("translations only contain keys English has", () => {
  const english = new Set(keys(load("en")));
  for (const locale of LOCALES) {
    const stray = keys(load(locale)).filter((key) => !english.has(key));
    assert.deepEqual(stray, [], `${locale} has keys English does not`);
  }
});

test("no message contains an em or en dash", () => {
  for (const locale of LOCALES) {
    const text = readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8");
    assert.ok(!/[–—]/.test(text), locale);
  }
});

test("the saved choice wins, then the browser's languages in order, then English", () => {
  assert.equal(pickLocale("yo", "fr-FR,fr;q=0.9"), "yo");
  assert.equal(pickLocale(undefined, "de-DE,ha;q=0.8,fr;q=0.9"), "fr");
  assert.equal(pickLocale(undefined, "pcm-NG"), "pcm");
  assert.equal(pickLocale("xx", "de,es"), "en");
  assert.equal(pickLocale(undefined, null), "en");
  assert.equal(pickLocale(undefined, "fr;q=0,yo;q=0.5"), "yo");
});

test("a translation overrides English key by key and falls back for the rest", () => {
  const merged = mergeMessages({ a: { b: "one", c: "two" }, d: "three" }, { a: { b: "un" } });
  assert.deepEqual(merged, { a: { b: "un", c: "two" }, d: "three" });
});
