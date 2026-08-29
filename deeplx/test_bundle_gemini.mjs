import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const bundleSource = await readFile(
  new URL("./Translate.response.deeplx.bundle.js", import.meta.url),
  "utf8",
);
const testAPIKey = "test-gemini-api-key";

async function runGemini({ model = "", status = 200, translations }) {
  const logMessages = [];
  const originalConsole = {};
  for (const method of ["log", "info", "warn", "error", "debug"]) {
    originalConsole[method] = console[method];
    console[method] = (...values) => logMessages.push(values.join(" "));
  }

  let capturedRequest;
  let requestCount = 0;
  let resolveDone;
  const completed = new Promise(resolve => {
    resolveDone = resolve;
  });
  const originalBody = JSON.stringify({
    events: [
      { tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Hello" }] },
      { tStartMs: 1000, dDurationMs: 1000, segs: [{ utf8: "World" }] },
    ],
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
      requestCount += 1;
      if (status === 429) {
        callback(
          null,
          { status: 429, headers: { "Content-Type": "application/json" } },
          JSON.stringify({
            error: { code: 429, message: "Resource exhausted" },
          }),
        );
        return;
      }
      callback(
        null,
        { status: 200, headers: { "Content-Type": "application/json" } },
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(translations) }],
              },
            },
          ],
        }),
      );
    },
  };
  globalThis.$request = {
    url: "https://www.youtube.com/api/timedtext?subtype=Translate&lang=en&tlang=zh",
  };
  globalThis.$response = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: originalBody,
  };
  globalThis.$argument =
    'Vendor="Gemini"&Gemini.Key="' +
    testAPIKey +
    '"&Gemini.Model="' +
    model +
    '"&Position="Forward"&ShowOnly="false"&LogLevel="ERROR"';
  globalThis.$done = value => resolveDone(value);

  const startedAt = Date.now();
  let timeoutId;
  try {
    vm.runInThisContext(`(() => {\n${bundleSource}\n})()`, {
      filename: "Translate.response.deeplx.bundle.js#gemini-test",
    });
    const output = await Promise.race([
      completed,
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Translator did not call $done")),
          5000,
        );
      }),
    ]);
    return {
      capturedRequest,
      elapsedMs: Date.now() - startedAt,
      logMessages,
      originalBody,
      output,
      requestCount,
    };
  } finally {
    clearTimeout(timeoutId);
    for (const [method, implementation] of Object.entries(originalConsole)) {
      console[method] = implementation;
    }
  }
}

const defaultModel = await runGemini({ translations: ["你好", "世界"] });
assert.equal(defaultModel.requestCount, 1);
assert.equal(
  defaultModel.capturedRequest.url,
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
);
assert.equal(
  defaultModel.capturedRequest.headers["x-goog-api-key"],
  testAPIKey,
);
assert.equal(defaultModel.capturedRequest.url.includes(testAPIKey), false);
assert.equal(defaultModel.logMessages.join("\n").includes(testAPIKey), false);

const requestBody = JSON.parse(defaultModel.capturedRequest.body);
assert.equal(requestBody.generationConfig.responseMimeType, "application/json");
assert.deepEqual(requestBody.generationConfig.responseSchema, {
  type: "ARRAY",
  items: { type: "STRING" },
  minItems: 2,
  maxItems: 2,
});
assert.deepEqual(JSON.parse(requestBody.contents[0].parts[0].text), {
  source_language: "EN",
  target_language: "ZH",
  subtitles: ["Hello", "World"],
});

const translated = JSON.parse(defaultModel.output.body);
assert.equal(translated.events[0].segs[0].utf8, "Hello\n你好");
assert.equal(translated.events[1].segs[0].utf8, "World\n世界");

const customModel = await runGemini({
  model: "gemini-3.6-flash",
  translations: ["你好", "世界"],
});
assert.equal(
  customModel.capturedRequest.url,
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
);

const rateLimited = await runGemini({ status: 429 });
assert.equal(rateLimited.requestCount, 1, "Gemini HTTP 429 must not be retried");
assert.equal(
  rateLimited.output.body,
  rateLimited.originalBody,
  "Gemini HTTP 429 must preserve source subtitles",
);
assert.ok(
  rateLimited.elapsedMs < 500,
  `Gemini HTTP 429 fallback took ${rateLimited.elapsedMs} ms`,
);
assert.ok(rateLimited.logMessages.join("\n").includes("Gemini API 429"));

console.log("Gemini bundle integration tests passed");
