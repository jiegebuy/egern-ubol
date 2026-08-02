import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const VIDEO_ID = process.argv[2] ?? "-IhuFgiWNS4";
const DEEPLX_ENDPOINT = process.env.DEEPLX_ENDPOINT;
const REQUEST_BUNDLE =
  "https://github.com/DualSubs/YouTube/releases/download/v1.5.11/request.bundle.js";
const RESPONSE_BUNDLE =
  "https://github.com/DualSubs/YouTube/releases/download/v1.5.11/response.bundle.js";
const TRANSLATE_BUNDLE = new URL(
  "./Translate.response.deeplx.bundle.js",
  import.meta.url,
);
const CLIENT_VERSION = "20.10.4";
const CLIENT_USER_AGENT =
  "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3 like Mac OS X;)";
const BASE_ARGUMENT =
  'Type="Translate"&Types="Translate"&AutoCC="true"&Position="Forward"&Vendor="DeepLX"&ShowOnly="false"&LogLevel="ERROR"';

if (!DEEPLX_ENDPOINT) {
  throw new Error("Set DEEPLX_ENDPOINT to a full DeepLX /translate URL");
}
if (/["&]/.test(DEEPLX_ENDPOINT)) {
  throw new Error("DEEPLX_ENDPOINT contains unsupported argument characters");
}

const sourceCache = new Map();
const deepLXCalls = [];

async function fetchText(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
  }
  return { response, text };
}

async function remoteSource(url) {
  if (!sourceCache.has(url)) {
    const { text } = await fetchText(url);
    sourceCache.set(url, text);
  }
  return sourceCache.get(url);
}

function makeHttpClient() {
  const send = (method, request, callback) => {
    const options = typeof request === "string" ? { url: request } : request;
    let deepLXCall;
    if (new URL(options.url).hostname === "api.deeplx.org") {
      deepLXCall = {
        method,
        body: options.body,
      };
      try {
        const requestBody = JSON.parse(options.body);
        deepLXCall.requestSegments = String(requestBody.text).split("\n").length;
      } catch {}
      deepLXCalls.push(deepLXCall);
    }
    fetch(options.url, {
      method,
      headers: options.headers,
      body: method === "GET" ? undefined : options.body,
    })
      .then(async response => {
        const body = await response.text();
        if (deepLXCall) {
          deepLXCall.status = response.status;
          try {
            const parsed = JSON.parse(body);
            deepLXCall.code = parsed?.code;
            deepLXCall.message = parsed?.message ?? parsed?.msg;
            const translation = parsed?.data ?? parsed?.translation ?? parsed?.translations;
            if (typeof translation === "string") {
              deepLXCall.responseSegments = translation.trim().split("\n").length;
              deepLXCall.responseChars = translation.length;
            }
          } catch {
            deepLXCall.message = body.slice(0, 120);
          }
        }
        callback(
          null,
          {
            status: response.status,
            statusCode: response.status,
            headers: Object.fromEntries(response.headers.entries()),
          },
          body,
        );
      })
      .catch(error => {
        if (deepLXCall) deepLXCall.error = error.message;
        callback(error, null, null);
      });
  };

  return {
    get(request, callback) {
      send("GET", request, callback);
    },
    post(request, callback) {
      send("POST", request, callback);
    },
  };
}

async function runBundle({ source, filename, request, response, argument }) {
  globalThis.Egern = {};
  globalThis.$persistentStore = {
    read() {
      return null;
    },
    write() {
      return true;
    },
  };
  globalThis.$httpClient = makeHttpClient();
  globalThis.$request = request;
  globalThis.$argument = argument;
  if (response) globalThis.$response = response;
  else delete globalThis.$response;

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
      setTimeout(
        () => reject(new Error(`${filename} did not call $done within 30 seconds`)),
        30_000,
      ),
    ),
  ]);
}

function mergeRequest(request, patch) {
  return {
    ...request,
    ...patch,
    headers: { ...request.headers, ...patch?.headers },
  };
}

function parseBody(result, fallback) {
  const body = typeof result === "string" ? result : result?.body;
  return JSON.parse(body ?? fallback);
}

const watchHtml = await fetchText(
  `https://www.youtube.com/watch?v=${VIDEO_ID}&hl=en`,
).then(result => result.text);
const apiKey = watchHtml.match(/"INNERTUBE_API_KEY":"([^"]+)/)?.[1];
assert.ok(apiKey, "YouTube Innertube API key was not present in the watch page");

const initialPlayerRequest = {
  url: `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent": CLIENT_USER_AGENT,
    "X-YouTube-Client-Name": "5",
    "X-YouTube-Client-Version": CLIENT_VERSION,
  },
  body: JSON.stringify({
    context: {
      client: {
        clientName: "IOS",
        clientVersion: CLIENT_VERSION,
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        hl: "en",
        gl: "US",
      },
    },
    videoId: VIDEO_ID,
  }),
};

const requestSource = await remoteSource(REQUEST_BUNDLE);
const playerRequestPatch = await runBundle({
  source: requestSource,
  filename: "DualSubs.YouTube.request.bundle.js#player",
  request: initialPlayerRequest,
  argument: BASE_ARGUMENT,
});
const playerRequest = mergeRequest(initialPlayerRequest, playerRequestPatch);
const playerNetworkResponse = await fetchText(playerRequest.url, {
  method: "POST",
  headers: playerRequest.headers,
  body: playerRequest.body,
});

const responseSource = await remoteSource(RESPONSE_BUNDLE);
const playerResponsePatch = await runBundle({
  source: responseSource,
  filename: "DualSubs.YouTube.response.bundle.js#player",
  request: playerRequest,
  response: {
    status: playerNetworkResponse.response.status,
    headers: Object.fromEntries(playerNetworkResponse.response.headers.entries()),
    body: playerNetworkResponse.text,
  },
  argument: BASE_ARGUMENT,
});
const player = parseBody(playerResponsePatch, playerNetworkResponse.text);
const tracks =
  player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
const sourceTrack =
  tracks.find(track => track.languageCode === "en" && !track.kind) ?? tracks[0];
assert.ok(sourceTrack, "DualSubs player response contains no source caption track");
const selectedCaptionUrl = new URL(sourceTrack.baseUrl);
selectedCaptionUrl.searchParams.set("tlang", "zh");

const initialCaptionRequest = {
  url: selectedCaptionUrl.toString(),
  method: "GET",
  headers: { "User-Agent": CLIENT_USER_AGENT },
};
const captionRequestPatch = await runBundle({
  source: requestSource,
  filename: "DualSubs.YouTube.request.bundle.js#timedtext",
  request: initialCaptionRequest,
  argument: BASE_ARGUMENT,
});
const captionRequest = mergeRequest(initialCaptionRequest, captionRequestPatch);
const captionNetworkResponse = await fetchText(captionRequest.url, {
  method: "GET",
  headers: captionRequest.headers,
});
assert.ok(captionNetworkResponse.text.length > 0, "YouTube returned an empty caption body");
const captionContentType =
  captionNetworkResponse.response.headers.get("content-type")?.split(";")[0] ?? "";
const isJSON3 = captionNetworkResponse.text.trimStart().startsWith("{");
const sourceCaption = isJSON3 ? JSON.parse(captionNetworkResponse.text) : null;
const sourceCueCount = isJSON3
  ? sourceCaption.events.length
  : [...captionNetworkResponse.text.matchAll(/<text\b/g)].length;
assert.ok(sourceCueCount > 0, "YouTube caption body contains no subtitle cues");

const translateSource = await readFile(TRANSLATE_BUNDLE, "utf8");
const translateArgument = `${BASE_ARGUMENT}&DeepLX.Endpoint="${DEEPLX_ENDPOINT}"&DeepLX.Auth=""`;
const translatedPatch = await runBundle({
  source: translateSource,
  filename: "Translate.response.deeplx.bundle.js#timedtext",
  request: captionRequest,
  response: {
    status: captionNetworkResponse.response.status,
    headers: Object.fromEntries(captionNetworkResponse.response.headers.entries()),
    body: captionNetworkResponse.text,
  },
  argument: translateArgument,
});
const translatedBody =
  typeof translatedPatch === "string"
    ? translatedPatch
    : translatedPatch?.body ?? captionNetworkResponse.text;
let outputCueCount;
let bilingualCueCount;
let samples;

if (isJSON3) {
  const translatedCaption = JSON.parse(translatedBody);
  const subtitleLines = translatedCaption.events.flatMap(event =>
    (event.segs ?? []).map(segment => segment.utf8).filter(Boolean),
  );
  outputCueCount = translatedCaption.events.length;
  const bilingualLines = subtitleLines.filter(line => line.includes("\n"));
  bilingualCueCount = bilingualLines.length;
  samples = bilingualLines.slice(0, 3);
} else {
  const translatedCues = [...translatedBody.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)];
  outputCueCount = translatedCues.length;
  const bilingualCues = translatedCues
    .map(match => match[1])
    .filter(text => /(?:&#0*10;|&#x0*a;|\n|<br\s*\/?>)/i.test(text));
  bilingualCueCount = bilingualCues.length;
  samples = bilingualCues.slice(0, 3);
}

assert.equal(outputCueCount, sourceCueCount);
if (bilingualCueCount === 0) {
  console.error(
    "DeepLX diagnostics:",
    deepLXCalls.map(
      ({ status, code, message, error, requestSegments, responseSegments, responseChars }) => ({
        status,
        code,
        message,
        error,
        requestSegments,
        responseSegments,
        responseChars,
      }),
    ),
  );
}
assert.ok(bilingualCueCount > 0, "Translated caption contains no bilingual cues");
assert.equal(translatedBody.includes("\uE000"), false);
assert.equal(translatedBody.includes("\uE001"), false);
assert.ok(deepLXCalls.length > 0, "Translation bundle made no DeepLX requests");

console.log(
  JSON.stringify(
    {
      videoId: VIDEO_ID,
      playerTracks: tracks.length,
      sourceTrack: sourceTrack.languageCode,
      captionRequestSubtype: new URL(captionRequest.url).searchParams.get("subtype"),
      captionRequestTlang: new URL(captionRequest.url).searchParams.get("tlang"),
      captionContentType,
      sourceBytes: captionNetworkResponse.text.length,
      outputBytes: translatedBody.length,
      cues: outputCueCount,
      bilingualCues: bilingualCueCount,
      deepLXRequests: deepLXCalls.length,
      samples,
    },
    null,
    2,
  ),
);
