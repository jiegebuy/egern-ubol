const WATCH_HOSTS = new Set(["sync.caeluses.com", "api.deeplx.org"]);

function hostOf(url) {
  try {
    return new URL(String(url)).hostname;
  } catch {
    return "";
  }
}

function safeUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl));
    // Query strings can contain tokens, document IDs, or user content.
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "<invalid-url>";
  }
}

function selectedHeaders(headers) {
  if (!headers || typeof headers.get !== "function") return {};
  const result = {};
  for (const name of ["content-type", "content-length", "user-agent", "host"]) {
    const value = headers.get(name);
    if (value) result[name] = String(value).slice(0, 200);
  }
  return result;
}

export function requestEvent(ctx, now = new Date().toISOString()) {
  const request = ctx?.request;
  const url = String(request?.url || "");
  return {
    type: "request",
    at: now,
    method: String(request?.method || "GET"),
    url: safeUrl(url),
    host: hostOf(url),
    headers: selectedHeaders(request?.headers),
  };
}

export default async function (ctx) {
  const event = requestEvent(ctx);
  if (!WATCH_HOSTS.has(event.host)) return;
  console.log(`[Egern LiveDebug] ${JSON.stringify(event)}`);
  // This is an observer. Returning undefined leaves the request untouched.
}
