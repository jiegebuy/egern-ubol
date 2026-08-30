const COLORS = {
  background: "#10151C",
  card: "#1B2530",
  text: "#F4F7FA",
  muted: "#AAB7C4",
  good: "#54D18A",
  warn: "#F4B942",
  bad: "#FF6B6B",
};

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function statusLabel(result) {
  if (result.error) return `失败 · ${result.error}`;
  if (result.status >= 200 && result.status < 400) return `可达 · HTTP ${result.status}`;
  // CouchDB without credentials normally answers 401; that proves TLS and routing work.
  if (result.status === 401) return "可达 · HTTP 401（需要认证）";
  return `收到响应 · HTTP ${result.status}`;
}

function statusColor(result) {
  if (result.error) return COLORS.bad;
  if ((result.status >= 200 && result.status < 400) || result.status === 401) return COLORS.good;
  return COLORS.warn;
}

async function probe(ctx, url, timeout) {
  const started = Date.now();
  try {
    const response = await ctx.http.get(url, {
      timeout,
      credentials: "omit",
      redirect: "manual",
    });
    return {
      url,
      status: Number(response?.status || 0),
      latency: Date.now() - started,
      error: null,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      latency: Date.now() - started,
      error: String(error?.message || error || "请求失败").slice(0, 120),
    };
  }
}

function text(value, color = COLORS.text, size = "caption1", weight = "regular", extra = {}) {
  return {
    type: "text",
    text: String(value),
    font: { size, weight },
    textColor: color,
    ...extra,
  };
}

function row(children, extra = {}) {
  return { type: "stack", direction: "row", alignItems: "center", gap: 6, children, ...extra };
}

function hostLabel(result) {
  if (result?.host) return result.host;
  try {
    return new URL(String(result?.url || "")).hostname || "目标地址";
  } catch {
    return "目标地址";
  }
}

export function renderProbeWidget(results, family = "systemMedium") {
  const compact = family?.startsWith("accessory");
  const children = [
    text("Egern LiveDebug", COLORS.text, compact ? "caption1" : "headline", "bold"),
    ...results.map((result) => row([
      text(hostLabel(result), statusColor(result), "caption1", "semibold", { flex: 1, maxLines: 1 }),
      text(statusLabel(result), statusColor(result), "caption2", "regular", { maxLines: 2, minScale: 0.6 }),
      text(`${result.latency} ms`, COLORS.muted, "caption2"),
    ], { padding: compact ? 5 : 8, backgroundColor: COLORS.card, borderRadius: 9 })),
    text(`刷新：${new Date().toLocaleTimeString("zh-CN", { hour12: false })}`, COLORS.muted, "caption2"),
  ];
  return {
    type: "widget",
    refreshAfter: new Date(Date.now() + 30000).toISOString(),
    backgroundColor: COLORS.background,
    padding: compact ? 6 : 12,
    gap: compact ? 4 : 7,
    children,
  };
}

export default async function (ctx) {
  const env = ctx?.env || {};
  const timeout = Math.max(1, Math.min(20, number(env.PROBE_TIMEOUT, 5))) * 1000;
  const targets = [
    String(env.SYNC_URL || "https://sync.caeluses.com/"),
    String(env.DEEPLX_URL || "https://api.deeplx.org/"),
  ];
  const results = await Promise.all(targets.map((url) => probe(ctx, url, timeout)));
  return renderProbeWidget(results, ctx?.widgetFamily || "systemMedium");
}
