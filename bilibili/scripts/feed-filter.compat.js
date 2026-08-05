// BBZQ-style JSON feed filters for Surge-compatible module runtimes.
(function () {
  function parseArguments(raw) {
    if (raw && typeof raw === "object") return raw;
    if (typeof raw !== "string" || !raw) return {};
    return Object.fromEntries(
      raw.split("&").map((part) => {
        const separator = part.indexOf("=");
        const key = separator === -1 ? part : part.slice(0, separator);
        let value = separator === -1 ? "" : part.slice(separator + 1);
        value = value.replace(/^"|"$/g, "");
        try {
          value = decodeURIComponent(value);
        } catch (_) {}
        return [key, value];
      }),
    );
  }

  function list(value) {
    return String(value || "")
      .split(/[,，\n]/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  function textOf(item) {
    return [item?.title, item?.subtitle, item?.desc, item?.args?.up_name, item?.player_args?.title]
      .filter((value) => typeof value === "string")
      .join("\n")
      .toLowerCase();
  }

  function matchesType(item, blocked) {
    const cardType = String(item?.card_type || "").toLowerCase();
    const cardGoto = String(item?.card_goto || "").toLowerCase();
    const goto = String(item?.goto || "").toLowerCase();
    const uri = String(item?.uri || "").toLowerCase();
    return (
      (blocked.has("picture") && (cardGoto === "picture" || goto === "picture" || uri.startsWith("bilibili://opus/"))) ||
      (blocked.has("game") && (cardGoto.includes("game") || goto.includes("game") || uri.includes("game_center"))) ||
      (blocked.has("live") && (cardGoto === "live" || goto === "live" || uri.includes("live.bilibili.com/"))) ||
      (blocked.has("ketang") && (cardGoto === "ketang" || goto === "ketang" || uri.includes("/cheese/play/"))) ||
      (blocked.has("vertical") && (cardGoto === "vertical_av" || goto === "vertical_av" || uri.startsWith("bilibili://story/"))) ||
      (blocked.has("large") && (cardType.startsWith("large_cover") || cardGoto === "inline_av_v2"))
    );
  }

  try {
    const args = parseArguments(typeof $argument === "undefined" ? "" : $argument);
    if (String(args["Feed.Filter"] || "false").toLowerCase() !== "true") {
      $done({});
      return;
    }
    const payload = JSON.parse($response?.body || "{}");
    const items = payload?.data?.items;
    if (!Array.isArray(items)) {
      $done({});
      return;
    }
    const blocked = new Set(list(args["Feed.FilterTypes"]));
    const keywords = list(args["Feed.TitleKeywords"]);
    payload.data.items = items.filter((item) => {
      if (matchesType(item, blocked)) return false;
      const text = textOf(item);
      return !keywords.some((keyword) => text.includes(keyword));
    });
    $response.body = JSON.stringify(payload);
    $done($response);
  } catch (error) {
    console.log(`BiliBili feed filter error: ${error}`);
    $done({});
  }
})();
