// Generated from official uBO Lite 2026.729.1529.
// Dedicated IPLark bridge for the four AdGuard Chinese cosmetic selectors.
// The site injects its ad containers after page load, so the rules are also
// appended to its external stylesheet as a CSP-independent path.

const SELECTORS = ["div[class^=\"banner\"]","div[style=\"position: relative;\"]","body > div:not([class]):not([style])","body > #capture-area ~ div[class]:empty"];
const CSS = `${SELECTORS.join(",\n")}{display:none!important;}`;
const HTML_MARKER = 'data-egern-ubol="iplark"';
const STYLESHEET_MARKER = "/* egern-ubol:iplark */";

export function injectCss(html) {
  if (html.includes(HTML_MARKER)) {
    return html;
  }
  const style = `<style ${HTML_MARKER}>${CSS}</style>`;
  if (/<\/head\s*>/i.test(html)) {
    return html.replace(/<\/head\s*>/i, (closing) => style + closing);
  }
  if (/<body\b[^>]*>/i.test(html)) {
    return html.replace(/<body\b[^>]*>/i, (opening) => opening + style);
  }
  return style + html;
}

export function injectStylesheet(stylesheet) {
  if (stylesheet.includes(STYLESHEET_MARKER)) {
    return stylesheet;
  }
  return `${stylesheet}\n${STYLESHEET_MARKER}\n${CSS}\n`;
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
  const url = ctx.request?.url || "";
  if (/text\/css/i.test(contentType) || /\/static\/homepage\.css(?:[?#]|$)/i.test(url)) {
    const stylesheet = await ctx.response.text();
    const body = injectStylesheet(stylesheet);
    return body === stylesheet ? undefined : { body };
  }
  if (contentType && !/(?:text\/html|application\/xhtml\+xml)/i.test(contentType)) {
    return undefined;
  }
  const html = await ctx.response.text();
  const body = injectCss(html);
  return body === html ? undefined : { body };
}
