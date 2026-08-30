function hostOf(url) {
  try {
    return new URL(String(url)).hostname;
  } catch (_) {
    return "";
  }
}

function safeUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl));
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (_) {
    return "<invalid-url>";
  }
}

function selectedHeaders(headers) {
  if (!headers || typeof headers !== "object") return {};
  const result = {};
  ["Content-Type", "Content-Length", "User-Agent", "Host"].forEach((name) => {
    const value = headers[name] || headers[name.toLowerCase()];
    if (value) result[name.toLowerCase()] = String(value).slice(0, 200);
  });
  return result;
}

const url = String($request.url || "");
const event = {
  type: "request",
  at: new Date().toISOString(),
  id: String($request.id || ""),
  method: String($request.method || "GET"),
  url: safeUrl(url),
  host: hostOf(url),
  headers: selectedHeaders($request.headers),
};

console.log(`[Egern LiveDebug] ${JSON.stringify(event)}`);
// Observer only: keep the request unchanged.
$done({});
