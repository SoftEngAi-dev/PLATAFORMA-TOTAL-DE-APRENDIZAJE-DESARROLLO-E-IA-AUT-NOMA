import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the starter web experience exposes a progressive curriculum", async () => {
  const source = await readFile("apps/web/app.js", "utf8");
  assert.match(source, /Pensamiento computacional/);
  assert.match(source, /Fundamentos de Python/);
  assert.match(source, /APIs y datos/);
});
