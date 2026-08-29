import assert from "node:assert/strict";

const logMessages = [];
const originalConsole = {};
for (const method of ["log", "info", "warn", "error", "debug"]) {
  originalConsole[method] = console[method];
  console[method] = (...values) => logMessages.push(values.join(" "));
}

let requestCount = 0;
let resolveDone;
const completed = new Promise(resolve => {
  resolveDone = resolve;
});

globalThis.Egern = {};
globalThis.$persistentStore = {
  read() {
    return null;
  },
  write() {
    return true;
  },
};
globalThis.$httpClient = {
  get() {
    throw new Error("Unexpected GET request");
  },
  post(_request, callback) {
    requestCount += 1;
    callback(
      null,
      { status: 429, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ code: 429, message: "too many requests" }),
    );
  },
};
globalThis.$request = {
  url: "https://www.youtube.com/api/timedtext?subtype=Translate&lang=en&tlang=zh",
};
const originalBody =
  '<transcript><text start="0" dur="1">Hello</text>' +
  '<text start="1" dur="1">World</text></transcript>';
globalThis.$response = {
  status: 200,
  headers: { "Content-Type": "text/xml" },
  body: originalBody,
};
globalThis.$argument =
  'Vendor="DeepLX"&DeepLX.Endpoint="https://api.deeplx.org/test-api-key/translate"&DeepLX.Auth=""&Position="Forward"&ShowOnly="false"&LogLevel="ERROR"';
globalThis.$done = value => resolveDone(value);

const startedAt = Date.now();
await import("./Translate.response.deeplx.bundle.js");
const output = await Promise.race([
  completed,
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Translator did not call $done")), 5000),
  ),
]);
const elapsedMs = Date.now() - startedAt;

for (const [method, implementation] of Object.entries(originalConsole)) {
  console[method] = implementation;
}

assert.equal(requestCount, 1, "HTTP 429 must not be retried");
assert.equal(output.body, originalBody, "HTTP 429 must preserve source subtitles");
assert.ok(elapsedMs < 500, `HTTP 429 fallback took ${elapsedMs} ms`);
assert.ok(logMessages.join("\n").includes("DeepLX HTTP 429"));
console.log("DeepLX HTTP 429 fallback test passed");
