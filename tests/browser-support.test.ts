import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the compile target keeps iOS 15.4 and older Android browsers working", () => {
  const lines = readFileSync(new URL("../.browserslistrc", import.meta.url), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  assert.deepEqual(lines, ["chrome >= 111", "edge >= 111", "firefox >= 111", "safari >= 15.4", "ios_saf >= 15.4"]);
});
