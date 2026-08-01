import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const profile = path.join(root, "dist", "memory-safe");
const metadata = JSON.parse(
  fs.readFileSync(path.join(profile, "metadata.json"), "utf8"),
);
const details = metadata.rulesets.find(
  (item) => item.id === "adguard-spyware-url",
);
const sample = details.output.query_cleaning_sample;
const scriptUrl = pathToFileURL(
  path.join(profile, "scripts", "adguard-spyware-url.js"),
).href;
const cleaner = await import(scriptUrl);

test("generated query cleaner removes an upstream tracking parameter", () => {
  const input = `https://${sample.domain}/article?${sample.parameter}=tracker&keep=1`;
  const output = cleaner.cleanUrl(input);
  const parsed = new URL(output);
  assert.equal(parsed.searchParams.has(sample.parameter), false);
  assert.equal(parsed.searchParams.get("keep"), "1");
});

test("generated query cleaner leaves unrelated hosts alone", () => {
  const input = `https://not-${sample.domain}/article?${sample.parameter}=tracker`;
  assert.equal(cleaner.cleanUrl(input), undefined);
});

test("module environment switch disables query cleaning", async () => {
  const input = `https://${sample.domain}/?${sample.parameter}=tracker`;
  const result = await cleaner.default({
    env: { ENABLE_QUERY_CLEANING: "false" },
    request: { url: input },
  });
  assert.equal(result, undefined);
});
