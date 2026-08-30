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
  for (const name of ["content-type", "content-length", "server", "www-authenticate", "location"]) {
    const value = headers.get(name);
    if (value) result[name] = String(value).slice(0, 200);
  }
  return result;
}

function bool(value) {
  return String(value || "").trim().toLowerCase() === "true";
}

export function responseEvent(ctx, now = new Date().toISOString()) {
  const request = ctx?.request;
  const response = ctx?.response;
  const url = String(request?.url || "");
  return {
    type: "response",
    at: now,
    method: String(request?.method || "GET"),
    url: safeUrl(url),
    host: hostOf(url),
    status: Number(response?.status || 0),
    headers: selectedHeaders(response?.headers),
  };
}

export default async function (ctx) {
  const event = responseEvent(ctx);
  if (!WATCH_HOSTS.has(event.host)) return;
  console.log(`[Egern LiveDebug] ${JSON.stringify(event)}`);

  if (bool(ctx?.env?.NOTIFY_ERRORS) && (event.status >= 400 || event.status === 0)) {
    ctx.notify?.({
      title: "Egern LiveDebug",
      subtitle: `${event.host} · HTTP ${event.status || "请求失败"}`,
      body: event.url,
      sound: false,
      duration: 5,
    });
  }
  // This is an observer. Returning undefined leaves the response untouched.
}
