// Generated from official uBO Lite 2026.825.1619.
// Plain site-specific cosmetic selectors only; procedural rules are omitted.

const RULESET_ID = "rus-1";
const SELECTORS = ["a[href*=\"//www.liveinternet.ru/stat/\"][aria-label=\"LiveInternet\"]","a[href*=\"rambler.ru/top100/\"]","a[href*=\"top100.rambler.ru/\"]","._3S8wP > div:first-child + div",".disableAdvButton__container","article div:has(> div > [id^=\"rcmw-container-\"])","circle[stroke-dashoffset]","section > nav ~ div div:has(> div > [id^=\"rcmw-container-\"])","a[href=\"http://vtambove.ru/advert/banner_network/\"]","a[href*=\"://metrika.yandex.ru/stat/\"]","#banner_counters",".liveinternet","#bigmirTop","#p-counters","body[onload] > [id]:not([class]):nth-child(-1n+7):not([id^=\"ajax\"]):not([id^=\"body_\"]):not([id^=\"fancybox-\"])","#page_footer > .copyright > center:first-child","#picContainer > img","#side_right > .block_r:has(> div [href*=\"liveinternet.ru/\"])","#unsafe-inline",".ad_title",".ad_title > a","div[id^=\"leaderboard_ad\"] > *",".b-footer__counters",".bbanerr",".bc > .il:last-child > .bp",".bcounts",".contbaner",".content-blocked-overlay",".copyright ~ .copyright",".counters",".footer [id]:has(> b)",".main > #footer ~ table",".metrics-informer",".ph-logo_doodle[href^=\"https://universal-link.mail.ru/\"]",".region-sidebar-first > .block:has(> .content > [href*=\"metrika\"])",".revolvermaps","footer > .counter",".sibnet-footer__counters","[aria-label=\"raichuLogoLink\"]","[class^=\"Footer_liveinternet\"]","[data-react-rcm-block]","img[alt=\"liru\"]","img[width=\"1\"][height=\"1\"]",".adbanner","main#main main > div[style^=\"margin-bottom:\"] [aria-label=\"Акция\"]","main#main main > div[style^=\"margin-bottom:\"]:has([aria-label=\"Акция\"])","main > div > div[data-hydration-id]"];
const SELECTOR_LISTS = ["-1","-2,-3,3,4,5,6,7","-9","-10","10","11,12","13","14,15","16","17","18","-20,20,21","22","23","24","25","26","27","28","29","30","31","32","33","34","35,36","37","38","39","40","5,6,7","14","41","42","-44","44,45","46"];
const HOSTNAMES = ["ya.ru","sfw.so","80-e.ru","mail.ru","ngzt.ru","tass.ru","yandex.*","innal.top","lurkmo.re","naylo.top","rutube.ru","samlab.ws","shakko.ru","sibnet.ru","yandex.ru","24warez.ru","fastpic.ru","ingrus.net","istmat.org","levik.blog","rambler.ru","lostfilm.tv","lostfilm.tw","lurkmore.to","otzovik.com","periskop.su","prokazan.ru","sinoptik.ua","svpressa.ru","vtambove.ru","game4you.top","ngnovoros.ru","only-paper.*","rustorka.com","rustorka.net","rustorka.top","eda.yandex.ru","inoreader.com","progorod59.ru","shiro-kino.ru","www.sibnet.ru","happy-hack.net","interface31.ru","progorodnsk.ru","avtorambler.com","liveinternet.ru","livejournal.com","rustorkacom.lib","vadimrazumov.ru","virtualbrest.ru","browserleaks.com","olegmakarenko.ru","yakusubstudio.ru","militaryreview.su","progorodchelny.ru","progorodsamara.ru","radioprofusion.com","player.cdnvideohub.com","yakusubstudio.home-forum.com"];
const SELECTOR_LIST_REFS = [36,4,18,23,19,28,3,31,6,31,27,21,29,26,3,19,8,15,24,29,1,33,33,6,32,29,19,5,12,2,7,19,34,7,7,7,35,11,19,29,14,9,22,19,30,0,29,7,29,20,10,29,16,13,19,19,25,17,16];
const HAS_ENTITIES = true;
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
