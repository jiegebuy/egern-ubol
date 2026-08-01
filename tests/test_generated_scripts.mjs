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
const cosmeticUrl = pathToFileURL(
  path.join(root, "dist", "full", "cosmetic", "chn-0.js"),
).href;
const cosmetic = await import(cosmeticUrl);

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

test("generated Chinese cosmetic script carries the official IPLark selectors", () => {
  const selectors = cosmetic.selectorsForHostname("www.iplark.com");
  assert.ok(selectors.includes('div[class^="banner"]'));
  assert.ok(selectors.includes('div[style="position: relative;"]'));
  assert.ok(selectors.includes("body > div:not([class]):not([style])"));
  assert.ok(selectors.includes("body > #capture-area ~ div[class]:empty"));
});

test("generated cosmetic response script injects CSS into IPLark HTML", async () => {
  const html = "<html><head><title>IPLark</title></head><body></body></html>";
  const result = await cosmetic.default({
    env: {},
    request: { url: "https://iplark.com/" },
    response: {
      headers: { get: () => "text/html; charset=utf-8" },
      text: async () => html,
    },
  });
  assert.match(result.body, /data-egern-ubol="chn-0"/);
  assert.match(result.body, /body > #capture-area ~ div\[class\]:empty/);
  assert.ok(result.body.indexOf("<style") < result.body.indexOf("</head>"));
});

test("cosmetic environment switch avoids reading the response body", async () => {
  const result = await cosmetic.default({
    env: { ENABLE_COSMETIC_FILTERING: "false" },
    request: { url: "https://iplark.com/" },
    response: {
      headers: { get: () => "text/html" },
      text: async () => {
        throw new Error("body should not be read");
      },
    },
  });
  assert.equal(result, undefined);
});
