// Generated from official uBO Lite 2026.901.1442.
// Query-only transforms without initiator/domain-type conditions are included.

const OPS = [
  {"d":["aparat.com"],"p":["referer"]},
  {"d":["app.technews-iran.com"],"p":["_ga"]},
  {"d":["app.technews-iran.com"],"p":["_gl"]},
  {"d":["arnr.ir","upera.tv"],"p":["ref"]},
  {"d":["dgka.me"],"p":["bCode"]},
  {"d":["dgka.me"],"p":["promo_creative"]},
  {"d":["dgka.me"],"p":["promo_name"]},
  {"d":["dgka.me"],"p":["promo_position"]},
  {"d":["eghtesadnews.com"],"p":["rssRedirect"]},
  {"d":["jobinja.ir"],"p":["_ref"]},
  {"d":["open-platform-redirect.divar.ir"],"p":["source"]},
  {"d":["www.digikala.com"],"p":["bCode"]},
  {"d":["www.digikala.com"],"p":["camCode"]},
  {"d":["www.digikala.com"],"p":["promo_creative"]},
  {"d":["www.digikala.com"],"p":["promo_name"]},
  {"d":["www.digikala.com"],"p":["promo_position"]},
  {"f":"(?:[^A-Za-z0-9_.%\\-]|$)safarmarketid=","p":["safarmarketId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.torob\\.com/v4/product\\-page/redirect(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)search_id=","p":["search_id"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?podbean\\.com/pb(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)pbss=","p":["pbss"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?podbean\\.com/player(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)referrer=","p":["referrer"]}
];

const PARAM_OPS = new Map();
const CLEAR_OPS = [];

for (let index = 0; index < OPS.length; index += 1) {
  const operation = OPS[index];
  if (operation.q) {
    CLEAR_OPS.push(index);
  }
  for (const parameter of operation.p || []) {
    let indexes = PARAM_OPS.get(parameter);
    if (indexes === undefined) {
      indexes = [];
      PARAM_OPS.set(parameter, indexes);
    }
    indexes.push(index);
  }
  if (operation.f) {
    try {
      operation.r = new RegExp(operation.f, operation.s ? "" : "i");
    } catch {
      operation.r = null;
    }
  }
}

function domainMatches(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function scopeMatches(hostname, operation) {
  if (operation.d && !operation.d.some((domain) => domainMatches(hostname, domain))) {
    return false;
  }
  if (operation.x && operation.x.some((domain) => domainMatches(hostname, domain))) {
    return false;
  }
  return true;
}

function filterMatches(url, operation) {
  return operation.f === undefined || operation.r?.test(url) === true;
}

export function cleanUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return undefined;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  for (const index of CLEAR_OPS) {
    const operation = OPS[index];
    if (
      parsed.search &&
      scopeMatches(hostname, operation) &&
      filterMatches(input, operation)
    ) {
      parsed.search = "";
      return parsed.toString();
    }
  }

  const visited = new Set();
  let changed = false;
  for (const parameter of new Set(parsed.searchParams.keys())) {
    for (const index of PARAM_OPS.get(parameter) || []) {
      if (visited.has(index)) {
        continue;
      }
      visited.add(index);
      const operation = OPS[index];
      if (!scopeMatches(hostname, operation) || !filterMatches(input, operation)) {
        continue;
      }
      for (const name of operation.p) {
        if (parsed.searchParams.has(name)) {
          parsed.searchParams.delete(name);
          changed = true;
        }
      }
    }
  }
  return changed ? parsed.toString() : undefined;
}

export default async function (ctx) {
  if (ctx.env?.ENABLE_QUERY_CLEANING === "false") {
    return undefined;
  }
  const cleaned = cleanUrl(ctx.request?.url);
  return cleaned === undefined ? undefined : { url: cleaned };
}
