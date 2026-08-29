import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const CACHE_KEY = "@DualSubs.YouTube.Caches.OfficialTracks";
const BASE_ARGUMENT =
  'Type="Translate"&Types="Translate"&AutoCC="true"&Position="Forward"&Vendor="DeepLX"&ShowOnly="false"&LogLevel="ERROR"';

const sources = {
  request: await readFile(
    new URL("./YouTube.request.official.v3.bundle.js", import.meta.url),
    "utf8",
  ),
  response: await readFile(
    new URL("./YouTube.response.official.v3.bundle.js", import.meta.url),
    "utf8",
  ),
  composite: await readFile(
    new URL("./Composite.Subtitles.response.official.v3.bundle.js", import.meta.url),
    "utf8",
  ),
};

function createStore() {
  const data = new Map();
  return {
    data,
    read(key) {
      return data.get(key) ?? null;
    },
    write(value, key) {
      data.set(key, value);
      return true;
    },
  };
}

async function runBundle({
  source,
  filename,
  request,
  response,
  store,
  httpGet,
  argument = BASE_ARGUMENT,
}) {
  globalThis.Egern = {};
  globalThis.$request = request;
  globalThis.$argument = argument;
  globalThis.$persistentStore = store;
  if (response) globalThis.$response = response;
  else delete globalThis.$response;
  globalThis.$httpClient = {
    get(options, callback) {
      if (!httpGet) return callback(new Error("Unexpected HTTP GET"));
      Promise.resolve(httpGet(options)).then(
        result => callback(null, result, result.body),
        error => callback(error),
      );
    },
    post(_options, callback) {
      callback(new Error("Unexpected HTTP POST"));
    },
  };

  let resolveDone;
  let rejectDone;
  const completed = new Promise((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  globalThis.$done = value => resolveDone(value ?? {});

  try {
    vm.runInThisContext(`(() => {\n${source}\n})()`, { filename });
  } catch (error) {
    rejectDone(error);
  }

  return Promise.race([
    completed,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${filename} did not finish`)), 5_000),
    ),
  ]);
}

function captionUrl(videoId, languageCode) {
  return `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${encodeURIComponent(languageCode)}&fmt=json3&sig=${encodeURIComponent(languageCode)}`;
}

function playerBody(videoId, languageCodes) {
  return JSON.stringify({
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: languageCodes.map(languageCode => ({
          baseUrl: captionUrl(videoId, languageCode),
          languageCode,
          name: { simpleText: languageCode },
        })),
        audioTracks: [],
        translationLanguages: [],
      },
    },
  });
}

async function cacheTracks(store, videoId, languages) {
  await runBundle({
    source: sources.response,
    filename: `YouTube.response.official.bundle.js#${videoId}`,
    request: {
      url: "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    response: {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: playerBody(videoId, languages),
    },
    store,
  });
}

async function routeTimedtext(
  store,
  videoId,
  language = "en",
  target = "zh",
  httpGet,
) {
  const original = {
    url: `${captionUrl(videoId, language)}${target ? `&tlang=${target}` : ""}`,
    method: "GET",
    headers: {},
  };
  const result = await runBundle({
    source: sources.request,
    filename: `YouTube.request.official.bundle.js#${videoId}`,
    request: original,
    store,
    httpGet,
  });
  return new URL(result.url ?? original.url);
}

const simplifiedStore = createStore();
const exampleVideoId = "CK38RHLvZEc";
await cacheTracks(simplifiedStore, exampleVideoId, ["en", "zh-Hant", "zh"]);
const simplifiedCache = new Map(
  JSON.parse(simplifiedStore.read(CACHE_KEY) ?? "[]"),
).get(exampleVideoId);
assert.equal(simplifiedCache.chineseLanguageCode, "zh");
const simplifiedRequest = await routeTimedtext(simplifiedStore, exampleVideoId);
assert.equal(simplifiedRequest.searchParams.get("lang"), "zh");
assert.equal(simplifiedRequest.searchParams.get("tlang"), null);
assert.equal(simplifiedRequest.searchParams.get("dualsubs_tlang"), "zh");
assert.equal(simplifiedRequest.searchParams.get("subtype"), "Official");
assert.equal(simplifiedRequest.searchParams.get("sig"), "zh");
const alreadyChineseRequest = await routeTimedtext(
  simplifiedStore,
  exampleVideoId,
  "zh-Hant",
  null,
);
assert.equal(alreadyChineseRequest.searchParams.get("lang"), "zh");
assert.equal(alreadyChineseRequest.searchParams.get("subtype"), "Official");

const traditionalStore = createStore();
await cacheTracks(traditionalStore, "traditional", ["en", "zh-Hant"]);
const traditionalRequest = await routeTimedtext(traditionalStore, "traditional");
assert.equal(traditionalRequest.searchParams.get("lang"), "zh-Hant");
assert.equal(traditionalRequest.searchParams.get("tlang"), null);
assert.equal(
  traditionalRequest.searchParams.get("dualsubs_tlang"),
  "zh-Hant",
);
assert.equal(traditionalRequest.searchParams.get("subtype"), "Official");

const translationStore = createStore();
await cacheTracks(translationStore, "translate", ["en", "fr"]);
assert.equal(new Map(JSON.parse(translationStore.read(CACHE_KEY) ?? "[]")).size, 0);
const translationRequest = await routeTimedtext(
  translationStore,
  "translate",
  "en",
  "zh",
  () => ({ status: 200, body: "" }),
);
assert.equal(translationRequest.searchParams.get("lang"), "en");
assert.equal(translationRequest.searchParams.get("tlang"), null);
assert.equal(translationRequest.searchParams.get("subtype"), "Translate");

const failedDiscoveryResult = await runBundle({
  source: sources.request,
  filename: "YouTube.request.official.v3.bundle.js#strict-discovery-failure",
  request: {
    url: `${captionUrl("probe-failure", "en")}&tlang=zh`,
    method: "GET",
    headers: {},
  },
  store: createStore(),
  httpGet() {
    throw new Error("simulated track probe failure");
  },
});
assert.equal(failedDiscoveryResult.response.status, 502);
assert.match(
  JSON.parse(failedDiscoveryResult.response.body).detail,
  /simulated track probe failure/,
);

const chineseCaption = {
  events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "你好" }] }],
};
const englishCaption = {
  events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Hello" }] }],
};
const fetchedUrls = [];
const compositeResult = await runBundle({
  source: sources.composite,
  filename: "Composite.Subtitles.response.official.bundle.js#both",
  request: {
    url: simplifiedRequest.toString(),
    method: "GET",
    headers: {},
  },
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chineseCaption),
  },
  store: simplifiedStore,
  argument: BASE_ARGUMENT.replace('ShowOnly="false"', 'ShowOnly="true"'),
  httpGet(options) {
    fetchedUrls.push(new URL(options.url));
    return {
      status: 200,
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(englishCaption),
    };
  },
});

assert.equal(fetchedUrls.length, 1);
assert.equal(fetchedUrls[0].searchParams.get("lang"), "en");
assert.equal(fetchedUrls[0].searchParams.get("sig"), "en");
const bilingual = JSON.parse(compositeResult.body);
assert.equal(bilingual.events[0].segs[0].utf8, "Hello\n你好");

const failedOfficialResult = await runBundle({
  source: sources.composite,
  filename: "Composite.Subtitles.response.official.v2.bundle.js#strict-failure",
  request: {
    url: simplifiedRequest.toString(),
    method: "GET",
    headers: {},
  },
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chineseCaption),
  },
  store: simplifiedStore,
  httpGet() {
    throw new Error("simulated English-track fetch failure");
  },
});
assert.equal(failedOfficialResult.status, 502);
assert.equal(
  JSON.parse(failedOfficialResult.body).detail,
  "simulated English-track fetch failure",
);
assert.notEqual(failedOfficialResult.body, JSON.stringify(chineseCaption));

console.log(
  JSON.stringify(
    {
      simplified: simplifiedRequest.searchParams.get("subtype"),
      preferredChinese: simplifiedCache.chineseLanguageCode,
      traditionalFallback: traditionalRequest.searchParams.get("lang"),
      noChinese: translationRequest.searchParams.get("subtype"),
      composite: bilingual.events[0].segs[0].utf8,
    },
    null,
    2,
  ),
);

if (process.argv.includes("--live")) {
  const watchResponse = await fetch(
    `https://www.youtube.com/watch?v=${exampleVideoId}&hl=en`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const watchHTML = await watchResponse.text();
  const apiKey = watchHTML.match(/"INNERTUBE_API_KEY":"([^"]+)/)?.[1];
  assert.ok(apiKey, "YouTube watch page did not expose an Innertube API key");

  const clientVersion = "20.10.4";
  const userAgent =
    "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3 like Mac OS X;)";
  const playerResponse = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        "X-YouTube-Client-Name": "5",
        "X-YouTube-Client-Version": clientVersion,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "IOS",
            clientVersion,
            hl: "en",
            gl: "US",
          },
        },
        videoId: exampleVideoId,
      }),
    },
  );
  const playerText = await playerResponse.text();
  assert.equal(playerResponse.status, 200);
  const player = JSON.parse(playerText);
  const liveTracks =
    player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  const liveEnglish = liveTracks.find(
    track => track.languageCode === "en" && !track.kind,
  );
  assert.ok(liveEnglish, "Example video contains no official English track");

  const liveStore = createStore();
  await runBundle({
    source: sources.response,
    filename: "YouTube.response.official.bundle.js#live",
    request: {
      url: "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    response: {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: playerText,
    },
    store: liveStore,
  });

  const initialLiveCaptionURL = new URL(liveEnglish.baseUrl);
  initialLiveCaptionURL.searchParams.set("fmt", "json3");
  initialLiveCaptionURL.searchParams.set("tlang", "zh");
  const liveRequestPatch = await runBundle({
    source: sources.request,
    filename: "YouTube.request.official.bundle.js#live",
    request: {
      url: initialLiveCaptionURL.toString(),
      method: "GET",
      headers: { "User-Agent": userAgent },
    },
    store: liveStore,
  });
  const liveCaptionURL = new URL(liveRequestPatch.url);
  assert.equal(liveCaptionURL.searchParams.get("lang"), "zh");
  assert.equal(liveCaptionURL.searchParams.get("subtype"), "Official");
  assert.equal(liveCaptionURL.searchParams.get("tlang"), null);

  const uncachedLiveStore = createStore();
  const uncachedSrv3URL = new URL(initialLiveCaptionURL);
  uncachedSrv3URL.searchParams.delete("fmt");
  uncachedSrv3URL.searchParams.set("format", "srv3");
  uncachedSrv3URL.searchParams.set("tlang", "zh-Hans");
  const uncachedLiveRequestPatch = await runBundle({
    source: sources.request,
    filename: "YouTube.request.official.bundle.js#live-cache-miss",
    request: {
      url: uncachedSrv3URL.toString(),
      method: "GET",
      headers: { "User-Agent": userAgent },
    },
    store: uncachedLiveStore,
    async httpGet(options) {
      const response = await fetch(options.url, { headers: options.headers });
      return {
        status: response.status,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    },
  });
  const uncachedLiveCaptionURL = new URL(uncachedLiveRequestPatch.url);
  assert.equal(uncachedLiveCaptionURL.searchParams.get("lang"), "zh");
  assert.equal(uncachedLiveCaptionURL.searchParams.get("subtype"), "Official");
  assert.equal(uncachedLiveCaptionURL.searchParams.get("tlang"), null);
  assert.equal(uncachedLiveCaptionURL.searchParams.get("format"), "srv3");
  assert.equal(
    new Map(JSON.parse(uncachedLiveStore.read(CACHE_KEY) ?? "[]")).get(
      exampleVideoId,
    )?.chineseLanguageCode,
    "zh",
  );

  const liveChineseResponse = await fetch(liveCaptionURL, {
    headers: { "User-Agent": userAgent },
  });
  const liveChineseText = await liveChineseResponse.text();
  assert.equal(liveChineseResponse.status, 200);

  let officialFetches = 0;
  const liveComposite = await runBundle({
    source: sources.composite,
    filename: "Composite.Subtitles.response.official.bundle.js#live",
    request: {
      url: liveCaptionURL.toString(),
      method: "GET",
      headers: { "User-Agent": userAgent },
    },
    response: {
      status: 200,
      headers: Object.fromEntries(liveChineseResponse.headers.entries()),
      body: liveChineseText,
    },
    store: liveStore,
    argument: BASE_ARGUMENT.replace('ShowOnly="false"', 'ShowOnly="true"'),
    async httpGet(options) {
      officialFetches += 1;
      const response = await fetch(options.url, { headers: options.headers });
      return {
        status: response.status,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    },
  });
  const liveBilingual = JSON.parse(liveComposite.body);
  const liveLines = liveBilingual.events
    .flatMap(event => (event.segs ?? []).map(segment => segment.utf8))
    .filter(line => line?.includes("\n"));
  assert.equal(officialFetches, 1);
  assert.ok(liveLines.length > 0, "Live result contains no bilingual cues");

  const liveSrv3ChineseResponse = await fetch(uncachedLiveCaptionURL, {
    headers: { "User-Agent": userAgent },
  });
  const liveSrv3ChineseText = await liveSrv3ChineseResponse.text();
  assert.equal(liveSrv3ChineseResponse.status, 200);
  let liveSrv3OfficialFetches = 0;
  const liveSrv3Composite = await runBundle({
    source: sources.composite,
    filename: "Composite.Subtitles.response.official.bundle.js#live-srv3",
    request: {
      url: uncachedLiveCaptionURL.toString(),
      method: "GET",
      headers: { "User-Agent": userAgent },
    },
    response: {
      status: 200,
      headers: Object.fromEntries(liveSrv3ChineseResponse.headers.entries()),
      body: liveSrv3ChineseText,
    },
    store: uncachedLiveStore,
    async httpGet(options) {
      liveSrv3OfficialFetches += 1;
      const response = await fetch(options.url, { headers: options.headers });
      return {
        status: response.status,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    },
  });
  assert.equal(liveSrv3OfficialFetches, 1);
  assert.match(liveSrv3Composite.body, /The voice that came to me in a dream/);
  assert.match(liveSrv3Composite.body, /那曾在梦中向我传来的声音/);
  console.log(
    JSON.stringify(
      {
        liveVideo: exampleVideoId,
        officialTracks: liveTracks.filter(track => !track.kind).length,
        selected: "en + zh",
        routedSubtype: liveCaptionURL.searchParams.get("subtype"),
        uncachedRoutedSubtype:
          uncachedLiveCaptionURL.searchParams.get("subtype"),
        machineTranslationRequests: 0,
        bilingualCues: liveLines.length,
        srv3Bilingual: true,
        sample: liveLines.slice(0, 2),
      },
      null,
      2,
    ),
  );
}

if (process.argv.includes("--live-proto")) {
  const concatBytes = (...parts) => {
    const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  };
  const varint = value => {
    const bytes = [];
    do {
      let byte = value & 0x7f;
      value >>>= 7;
      if (value) byte |= 0x80;
      bytes.push(byte);
    } while (value);
    return Uint8Array.from(bytes);
  };
  const fieldTag = (number, wireType) => varint((number << 3) | wireType);
  const byteField = (number, bytes) =>
    concatBytes(fieldTag(number, 2), varint(bytes.length), bytes);
  const stringField = (number, value) =>
    byteField(number, new TextEncoder().encode(value));
  const integerField = (number, value) =>
    concatBytes(fieldTag(number, 0), varint(value));

  const clientVersion = "20.10.4";
  const userAgent =
    "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3 like Mac OS X;)";
  const client = concatBytes(
    stringField(1, "en"),
    stringField(2, "US"),
    stringField(12, "Apple"),
    stringField(13, "iPhone16,2"),
    integerField(16, 5),
    stringField(17, clientVersion),
    stringField(18, "iOS"),
    stringField(19, "18.3"),
    stringField(80, "America/Denver"),
  );
  const playerRequestBody = concatBytes(
    byteField(1, byteField(1, client)),
    stringField(2, exampleVideoId),
  );
  const watchResponse = await fetch(
    `https://www.youtube.com/watch?v=${exampleVideoId}&hl=en`,
  );
  const watchHTML = await watchResponse.text();
  const apiKey = watchHTML.match(/"INNERTUBE_API_KEY":"([^"]+)/)?.[1];
  assert.ok(apiKey, "YouTube watch page did not expose an Innertube API key");

  const protoRequest = {
    url: `https://youtubei.googleapis.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false&alt=proto`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-protobuf",
      "X-Goog-Api-Format-Version": "2",
      "X-YouTube-Client-Name": "5",
      "X-YouTube-Client-Version": clientVersion,
      "User-Agent": userAgent,
    },
    body: playerRequestBody,
  };
  const protoRequestPatch = await runBundle({
    source: sources.request,
    filename: "YouTube.request.official.bundle.js#live-proto",
    request: protoRequest,
    store: createStore(),
  });
  const protoResponse = await fetch(protoRequestPatch.url ?? protoRequest.url, {
    method: "POST",
    headers: protoRequestPatch.headers ?? protoRequest.headers,
    body: protoRequestPatch.body ?? protoRequest.body,
  });
  const protoResponseBody = new Uint8Array(await protoResponse.arrayBuffer());
  assert.equal(protoResponse.status, 200);
  assert.match(
    protoResponse.headers.get("content-type") ?? "",
    /application\/x-protobuf/,
  );

  const protoStore = createStore();
  await runBundle({
    source: sources.response,
    filename: "YouTube.response.official.bundle.js#live-proto",
    request: protoRequest,
    response: {
      status: 200,
      headers: { "Content-Type": "application/x-protobuf" },
      body: protoResponseBody,
    },
    store: protoStore,
  });
  const protoOfficialTracks = new Map(
    JSON.parse(protoStore.read(CACHE_KEY) ?? "[]"),
  ).get(exampleVideoId);
  assert.ok(
    protoOfficialTracks,
    "Protobuf player response did not cache official English and Chinese tracks",
  );
  console.log(
    JSON.stringify(
      {
        liveProtoVideo: exampleVideoId,
        responseBytes: protoResponseBody.length,
        englishLanguageCode: protoOfficialTracks.englishLanguageCode,
        chineseLanguageCode: protoOfficialTracks.chineseLanguageCode,
      },
      null,
      2,
    ),
  );
}
