// Generated from official uBO Lite 2026.729.1529.
// Dedicated IPLark bridge for the four AdGuard Chinese cosmetic selectors.

const SELECTORS = ["div[class^=\"banner\"]","div[style=\"position: relative;\"]","body > div:not([class]):not([style])","body > #capture-area ~ div[class]:empty"];
const MARKER = 'data-egern-ubol="iplark"';

export function injectCss(html) {
  if (html.includes(MARKER)) {
    return html;
  }
  const css = `${SELECTORS.join(",\n")}{display:none!important;}`;
  const style = `<style ${MARKER}>${css}</style>`;
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
  const contentType = responseContentType(ctx);
  if (contentType && !/(?:text\/html|application\/xhtml\+xml)/i.test(contentType)) {
    return undefined;
  }
  const html = await ctx.response.text();
  return { body: injectCss(html) };
}
