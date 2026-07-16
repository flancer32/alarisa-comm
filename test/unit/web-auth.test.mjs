import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

test("browser authentication messages are English", async () => {
  const client = await readFile("web/auth.js", "utf8");

  assert.doesNotMatch(client, /[\u0400-\u04FF]/);
});
