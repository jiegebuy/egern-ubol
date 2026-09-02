// Generated from official uBO Lite 2026.901.1442.
// Plain site-specific cosmetic selectors only; procedural rules are omitted.

const RULESET_ID = "annoyances-widgets";
const SELECTORS = ["#chat-wrapper","#chatbotToronto","#floating-experience-feature-tour-popover","#view-__module-context__-_amzn_conversational-experience-module__tandalone-0","[style*=\"display: flex; flex-direction: column; z-index: 999999;\"]","#launcher",".chat-button",".chat-container",".chatbotentrybtn",".healthshotsChannels",".secBannerWidget",".chatWindow",".chatbotSection",".chatbotSlider",".rufus-panel-container",".ux-faq-singtel",".woot-widget-bubble","ai-chatbot","button:has(> [alt=\"Chat\"])","button:has([alt=\"Chat with SIMBA\"])","div:has(> [class^=\"ChatWindow\"])","react-chatbot"];
const SELECTOR_LISTS = ["0","1","2,3","4,5","6,7","8,9,10,11,12,13","14","15","16","17","18","19","20","21"];
const HOSTNAMES = ["hp.com","ga4.com","simba.sg","m1.com.sg","amazon.com","casbin.org","singtel.com","vectara.com","healthhub.sg","healthshots.com","ishopchangi.com","therealdeal.com","docs.aws.amazon.com","support.carousell.com"];
const SELECTOR_LIST_REFS = [1,10,11,12,6,4,7,13,9,5,0,8,2,3];
const HAS_ENTITIES = false;
const REGEXES = [];

function hostnameIndex(needle) {
  let left = 0;
  let right = HOSTNAMES.length;
  while (left < right) {
    const index = (left + right) >>> 1;
    const candidate = HOSTNAMES[index];
    let order = needle.length - candidate.length;
    if (order === 0) {
      if (needle === candidate) {
        return index;
      }
      order = needle < candidate ? -1 : 1;
    }
    if (order < 0) {
      right = index;
    } else {
      left = index + 1;
    }
  }
  return -1;
}

function addSelectorList(reference, selectors, exceptions) {
  const encoded = SELECTOR_LISTS[reference];
  if (encoded === undefined) {
    return;
  }
  for (const part of encoded.split(",")) {
    const signedIndex = Number(part);
    const selector = SELECTORS[signedIndex >= 0 ? signedIndex : ~signedIndex];
    if (selector === undefined) {
      continue;
    }
    (signedIndex >= 0 ? selectors : exceptions).add(selector);
  }
}

function hostnameContexts(hostname) {
  const contexts = [hostname];
  for (let offset = 0; ; ) {
    offset = hostname.indexOf(".", offset) + 1;
    if (offset === 0) {
      break;
    }
    contexts.push(hostname.slice(offset));
  }
  contexts.push("*");
  return contexts;
}

export function selectorsForHostname(input) {
  const hostname = String(input || "").toLowerCase().replace(/\.$/, "");
  if (hostname === "") {
    return [];
  }

  const selectors = new Set();
  const exceptions = new Set();
  const contexts = hostnameContexts(hostname);
  for (const context of contexts) {
    const index = hostnameIndex(context);
    if (index !== -1) {
      addSelectorList(SELECTOR_LIST_REFS[index], selectors, exceptions);
    }
  }

  if (HAS_ENTITIES) {
    for (const context of contexts) {
      let entity = context;
      for (;;) {
        const offset = entity.lastIndexOf(".");
        if (offset === -1) {
          break;
        }
        entity = entity.slice(0, offset);
        const index = hostnameIndex(`${entity}.*`);
        if (index !== -1) {
          addSelectorList(SELECTOR_LIST_REFS[index], selectors, exceptions);
        }
      }
    }
  }

  for (let index = 0; index + 2 < REGEXES.length; index += 3) {
    const needle = REGEXES[index];
    if (typeof needle !== "string" || !hostname.includes(needle)) {
      continue;
    }
    try {
      if (new RegExp(REGEXES[index + 1]).test(hostname)) {
        addSelectorList(REGEXES[index + 2], selectors, exceptions);
      }
    } catch {
      // Ignore an upstream regular expression unsupported by this JS engine.
    }
  }

  for (const selector of exceptions) {
    selectors.delete(selector);
  }
  return Array.from(selectors);
}

export function injectCss(html, selectors) {
  if (selectors.length === 0) {
    return html;
  }
  const marker = `data-egern-ubol="${RULESET_ID}"`;
  if (html.includes(marker)) {
    return html;
  }
  const css = `${selectors.join(",\n")}{display:none!important;}`;
  const style = `<style ${marker}>${css}</style>`;
  if (/<\/head\s*>/i.test(html)) {
    return html.replace(/<\/head\s*>/i, (closing) => style + closing);
  }
  if (/<body\b[^>]*>/i.test(html)) {
    return html.replace(/<body\b[^>]*>/i, (opening) => opening + style);
  }
  return style + html;
}

function responseContentType(ctx) {
  const headers = ctx.response?.headers;
  if (typeof headers?.get === "function") {
    return headers.get("content-type") || "";
  }
  return headers?.["content-type"] || headers?.["Content-Type"] || "";
}

export default async function (ctx) {
  if (ctx.env?.ENABLE_COSMETIC_FILTERING === "false") {
    return undefined;
  }
  if (!/(?:text\/html|application\/xhtml\+xml)/i.test(responseContentType(ctx))) {
    return undefined;
  }

  let parsed;
  try {
    parsed = new URL(ctx.request?.url);
  } catch {
    return undefined;
  }
  const selectors = selectorsForHostname(parsed.hostname);
  if (selectors.length === 0) {
    return undefined;
  }

  const html = await ctx.response.text();
  const body = injectCss(html, selectors);
  return body === html ? undefined : { body };
}
