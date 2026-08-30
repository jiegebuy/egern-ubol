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
  ["Content-Type", "Content-Length", "Server", "WWW-Authenticate", "Location"].forEach((name) => {
    const value = headers[name] || headers[name.toLowerCase()];
    if (value) result[name.toLowerCase()] = String(value).slice(0, 200);
  });
  return result;
}

function argumentValue(name) {
  const text = String(typeof $argument === "string" ? $argument : "");
  const match = text.match(new RegExp(`(?:^|&)${name}=([^&]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

const url = String($request.url || "");
const status = Number($response.status || 0);
const event = {
  type: "response",
  at: new Date().toISOString(),
  id: String($request.id || ""),
  method: String($request.method || "GET"),
  url: safeUrl(url),
  host: hostOf(url),
  status,
  headers: selectedHeaders($response.headers),
};

console.log(`[Egern LiveDebug] ${JSON.stringify(event)}`);
if (argumentValue("NOTIFY_ERRORS").toLowerCase() === "true" && (status >= 400 || status === 0)) {
  $notification.post("Egern LiveDebug", `${event.host} · HTTP ${status || "请求失败"}`, event.url);
}
// Observer only: keep the response unchanged.
$done({});
