import assert from "node:assert/strict";

const logMessages = [];
const originalConsole = {};
for (const method of ["log", "info", "warn", "error", "debug"]) {
  originalConsole[method] = console[method];
  console[method] = (...values) => logMessages.push(values.join(" "));
}

let capturedRequest;
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
  post(request, callback) {
    capturedRequest = request;
    callback(
      null,
      { status: 200, headers: { "Content-Type": "application/json" } },
      JSON.stringify({ code: 200, data: "你好\n世界" }),
    );
  },
};
globalThis.$request = {
  url: "https://www.youtube.com/api/timedtext?subtype=Translate&lang=en&tlang=zh",
};
globalThis.$response = {
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    events: [
      { tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Hello" }] },
      { tStartMs: 1000, dDurationMs: 1000, segs: [{ utf8: "World" }] },
    ],
  }),
};
globalThis.$argument =
  'Vendor="DeepLX"&DeepLX.Endpoint="https://api.deeplx.org/test-api-key/translate"&DeepLX.Auth="test-api-key"&Position="Forward"&ShowOnly="false"&LogLevel="ERROR"';
globalThis.$done = value => resolveDone(value);

await import("./Translate.response.deeplx.bundle.js");
const output = await Promise.race([
  completed,
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Translator did not call $done")), 5000),
  ),
]);

for (const [method, implementation] of Object.entries(originalConsole)) {
  console[method] = implementation;
}

assert.equal(
  capturedRequest.url,
  "https://api.deeplx.org/test-api-key/translate",
);
assert.equal(capturedRequest.headers.Authorization, undefined);
assert.equal(logMessages.join("\n").includes("test-api-key"), false);
assert.deepEqual(JSON.parse(capturedRequest.body), {
  text: "Hello\nWorld",
  source_lang: "EN",
  target_lang: "ZH",
});

const translated = JSON.parse(output.body);
assert.equal(translated.events[0].segs[0].utf8, "Hello\n你好");
assert.equal(translated.events[1].segs[0].utf8, "World\n世界");
console.log("DeepLX bundle integration test passed");
