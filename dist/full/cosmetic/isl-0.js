// Generated from official uBO Lite 2026.1018.2229.
// Plain site-specific cosmetic selectors only; procedural rules are omitted.

const RULESET_ID = "isl-0";
const SELECTORS = ["#atop",".strevda","#banner","[href^=\"/is/moya/adverts/\"]","[id^=\"box_aitem\"]","aside","#banners","#cboxOverlay",".bp26",".bp4","#ctl00_ctl00_cphMain_cphMain_RandomBanner4_divBanner",".randombanner-upperright","#spoton","#mvp-leader-wrap",".widget_custom_html","[href^=\"https://airpark.is\"]","#snppopup-welcome",".tdi_103_674",".tdi_5_7f3",".tdi_5_cc0",".tdi_82","#tdi_4",".AuglysingaHnappur",".HeimildinAd_ad310400__iUf_1",".PulsAd310x400_iframe__9pkTN",".TopAd_all___Rrm_","[class*=\"FrontPageIS_\"]",".HorizontalAd_container__6Aymu",".augl-wrapper",".laufid-border.cover-photo",".side-augl-wrapper","[href^=\"https://old.1819.is/linkto/\"]",".ad",".ad-banner",".bsaProItems",".first-ad",".ad-front-310x400",".ad-front-635x150",".adbannermain",".adbox",".advertisement-spot-b",".col-md-4.col-12:has(.advertisement-spot-b)",".iframead-spot-a","[href^=\"AdPlayer.aspx\"]","div[class^=\"col-\"]:has([class*=\"advertisement-spot-\"])",".adw",".au-block",".real-estate-block",".real-estate-container",".augl",".mt-5.mb-5",".ticker-ad","div.col-lg-4.col-sm-6.col-12:has([data-url])",".bannergroup",".elementor-716826",".elementor-716842",".elementor-716846",".elementor-716862",".elementor-716869",".elementor-716890",".elementor-element-eb46190",".g",".widget_media_image",".mb-\\[-7px\\]",".netgiroInsuranceSection","div[id*=\"advImg\"]",".td-a-rec","div[id^=\"banner\"]","div[style^=\"margin:0px auto;height:310px;\"]"];
const SELECTOR_LISTS = ["0,1","2,1,3,4,5","6","7","8,9,10,11,12","13,14,15","16","17,18,19,20,21","22","23,24,25,26","27,28,29,30,31","32","33,34,35","36,37","38","39","40,41,42,43,44","45","46,47,48","49,50,51,52","53","54,55,56,57,58,59,60","61","61,62","63","64,65","1","66","14","62","67","68"];
const HOSTNAMES = ["bb.is","dv.is","ja.is","vb.is","vf.is","hun.is","kki.is","mbl.is","1819.is","bland.is","blika.is","gengi.is","doktor.is","eyjar.net","karfan.is","smugan.is","vaktin.is","eidfaxi.is","pressan.is","discover.is","nutiminn.is","akureyri.net","bilasolur.is","fotbolti.net","heimildin.is","hringbraut.is","skessuhorn.is","utvarpsaga.is","vikubladid.is","austurfrett.is","eyjafrettir.is","auroraforecast.is","veitingastadir.is","veitingageirinn.is","icelandwithaview.com"];
const SELECTOR_LIST_REFS = [22,3,17,18,11,6,8,19,10,25,9,24,15,22,27,31,2,12,4,28,7,1,16,30,11,26,13,22,0,20,21,14,23,5,29];
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
