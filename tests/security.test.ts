import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

test("no public environment variables: the API origin and secrets stay on the server", () => {
  const offenders = sourceFiles(SRC).filter((file) => readFileSync(file, "utf8").includes("NEXT_PUBLIC_"));
  assert.deepEqual(offenders, []);
});

test("browser storage is never used for credentials", () => {
  const offenders = sourceFiles(SRC).filter((file) =>
    /(localStorage|sessionStorage)[\s\S]{0,80}(token|session|auth)/i.test(readFileSync(file, "utf8")),
  );
  assert.deepEqual(offenders, []);
});

test("session and server modules are server-only", () => {
  for (const file of ["lib/auth/session.ts", "lib/auth/refresh.ts", "lib/api/server.ts"]) {
    assert.match(readFileSync(path.join(SRC, file), "utf8"), /^import "server-only";/, file);
  }
});
