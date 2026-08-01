// Generated from official uBO Lite 2026.729.1529.
// Query-only transforms without initiator/domain-type conditions are included.

const OPS = [
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?v\\.fwmrm\\.net/ad/g/1.*(?:[^A-Za-z0-9_.%\\-]|$)caid=","p":["caid"]}
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
