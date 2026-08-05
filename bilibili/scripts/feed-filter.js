// Extra BBZQ-style feed filters for BiliBili.ADBlock on Egern.
// This script only handles the JSON /x/v2/feed/index response. The upstream
// BiliUniverse bundle continues to handle ads and protobuf/gRPC responses.

function parseArguments(raw) {
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string" || raw.length === 0) return {};
  return Object.fromEntries(
    raw.split("&").map((part) => {
      const separator = part.indexOf("=");
      const key = separator === -1 ? part : part.slice(0, separator);
      let value = separator === -1 ? "" : part.slice(separator + 1);
      value = value.replace(/^"|"$/g, "");
      try {
        value = decodeURIComponent(value);
      } catch {
        // Keep the original text when it is not percent-encoded.
      }
      return [key, value];
    }),
  );
}

function enabled(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function list(value) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function textOf(item) {
  return [
    item?.title,
    item?.subtitle,
    item?.desc,
    item?.args?.up_name,
    item?.player_args?.title,
  ]
    .filter((value) => typeof value === "string")
    .join("\n")
    .toLowerCase();
}

function matchesType(item, blocked) {
  const cardType = String(item?.card_type || "").toLowerCase();
  const cardGoto = String(item?.card_goto || "").toLowerCase();
  const goto = String(item?.goto || "").toLowerCase();
  const uri = String(item?.uri || "").toLowerCase();

  if (
    blocked.has("picture") &&
    (cardGoto === "picture" || goto === "picture" || uri.startsWith("bilibili://opus/"))
  ) {
    return true;
  }
  if (
    blocked.has("game") &&
    (cardGoto.includes("game") || goto.includes("game") || uri.includes("game_center"))
  ) {
    return true;
  }
  if (
    blocked.has("live") &&
    (cardGoto === "live" || goto === "live" || uri.includes("live.bilibili.com/"))
  ) {
    return true;
  }
  if (
    blocked.has("ketang") &&
    (cardGoto === "ketang" || goto === "ketang" || uri.includes("/cheese/play/"))
  ) {
    return true;
  }
  if (
    blocked.has("vertical") &&
    (cardGoto === "vertical_av" || goto === "vertical_av" || uri.startsWith("bilibili://story/"))
  ) {
    return true;
  }
  if (
    blocked.has("large") &&
    (cardType.startsWith("large_cover") || cardGoto === "inline_av_v2")
  ) {
    return true;
  }
  return false;
}

export function filterFeed(payload, options = {}) {
  const items = payload?.data?.items;
  if (!Array.isArray(items)) return payload;

  const blocked = new Set(list(options.filterTypes));
  const keywords = list(options.titleKeywords);
  payload.data.items = items.filter((item) => {
    if (matchesType(item, blocked)) return false;
    if (keywords.length === 0) return true;
    const text = textOf(item);
    return !keywords.some((keyword) => text.includes(keyword));
  });
  return payload;
}

export default function main(context) {
  const args = parseArguments(context?.arguments ?? context?.env ?? globalThis.$argument);
  if (!enabled(args["Feed.Filter"], false)) return;

  const response = context?.response;
  if (!response || typeof response.text !== "function") return;

  return response.text().then((source) => {
    let payload;
    try {
      payload = JSON.parse(source);
    } catch {
      return;
    }
    filterFeed(payload, {
      filterTypes: args["Feed.FilterTypes"],
      titleKeywords: args["Feed.TitleKeywords"],
    });
    return { body: JSON.stringify(payload) };
  });
}
