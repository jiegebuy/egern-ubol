import { writeFile } from "node:fs/promises";

const RELEASE = "v1.5.11";
const SOURCES = {
  request: `https://github.com/DualSubs/YouTube/releases/download/${RELEASE}/request.bundle.js`,
  response: `https://github.com/DualSubs/YouTube/releases/download/${RELEASE}/response.bundle.js`,
  composite:
    "https://github.com/DualSubs/Universal/releases/download/v1.7.5/Composite.Subtitles.response.bundle.js",
};

const OUTPUTS = {
  request: new URL("./YouTube.request.official.bundle.js", import.meta.url),
  response: new URL("./YouTube.response.official.bundle.js", import.meta.url),
  composite: new URL(
    "./Composite.Subtitles.response.official.bundle.js",
    import.meta.url,
  ),
};

const CACHE_KEY = "@DualSubs.YouTube.Caches.OfficialTracks";

async function download(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  return response.text();
}

function replaceOnce(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) {
    throw new Error(`Expected one ${label} marker, found ${count}`);
  }
  return source.replace(marker, replacement);
}

const responseHelper = String.raw`function __dualSubsCacheOfficialTracks(e){try{let t=e?.playerCaptionsTracklistRenderer?.captionTracks;if(!Array.isArray(t)||!t.length)return;let a=t.filter(e=>e?.baseUrl&&"asr"!==String(e?.kind??"").toLowerCase()),n=e=>String(e?.languageCode??"").replace(/_/g,"-").toLowerCase(),s=a.find(e=>"en"===n(e))??a.find(e=>n(e).startsWith("en-")),r=["zh","zh-hans","zh-cn","zh-sg","zh-hant","zh-tw","zh-hk"].map(e=>a.find(t=>n(t)===e)).find(Boolean),i=t.map(e=>String(e?.baseUrl??"").match(/[?&]v=([^&]+)/)?.[1]).find(Boolean);if(!i)return;i=decodeURIComponent(i);let o=globalThis.$persistentStore;if(!o?.read||!o?.write)return;let l;try{l=JSON.parse(o.read("${CACHE_KEY}")||"[]")}catch{l=[]}let g=new Map(Array.isArray(l)?l:[]);n(s)==="en"&&r?g.set(i,{englishUrl:s.baseUrl,englishLanguageCode:s.languageCode||"en",chineseUrl:r.baseUrl,chineseLanguageCode:r.languageCode||"zh"}):g.delete(i),o.write(JSON.stringify(Array.from(g).slice(-50)),"${CACHE_KEY}")}catch(e){console.log("DualSubs official-track cache: "+e)}}`;

let responseSource = await download(SOURCES.response);
responseSource = replaceOnce(
  responseSource,
  "function aa(e,t,a){",
  `${responseHelper}function aa(e,t,a){__dualSubsCacheOfficialTracks(e);`,
  "YouTube response caption helper",
);
responseSource =
  "// Official Chinese-track preference patch for Egern. Based on DualSubs YouTube.\n" +
  responseSource;

const requestMarker = "$request.url=a1.toString()";
const requestPatch = String.raw`if("/api/timedtext"===a1.pathname){try{let t=a1.searchParams.get("v"),n=a1.searchParams.get("lang"),s=e?.Languages?.[1],r=globalThis.$persistentStore?.read?.("${CACHE_KEY}"),i=new Map(JSON.parse(r||"[]")),o=i.get(t);if(t&&/^(?:en|zh)(?:[-_]|$)/i.test(n||"")&&/^zh(?:[-_]|$)/i.test(s||"")&&o?.englishUrl&&o?.chineseUrl){let e=a1.searchParams.get("fmt"),n=a1.searchParams.get("format");a1=new a1.constructor(o.chineseUrl),e&&a1.searchParams.set("fmt",e),n&&a1.searchParams.set("format",n),a1.searchParams.set("v",t),a1.searchParams.set("dualsubs_tlang",o.chineseLanguageCode||"zh"),a1.searchParams.set("subtype","Official")}}catch(e){p.warn("Official track routing failed: "+e)}}$request.url=a1.toString()`;

let requestSource = await download(SOURCES.request);
requestSource = replaceOnce(
  requestSource,
  requestMarker,
  requestPatch,
  "YouTube timedtext request finalization",
);
requestSource =
  "// Official Chinese-track preference patch for Egern. Based on DualSubs YouTube.\n" +
  requestSource;

const compositeMarker =
  'else{a.info("生成双语字幕"),d.searchParams.set("lang",i.Playlists.Subtitle.get(d.searchParams.get("v"))||d.searchParams.get("lang")),d.searchParams.delete("tlang");let e={url:d.toString(),headers:$request.headers};x.push(e)}';
const compositePatch = String.raw`else{a.info("生成双语字幕");let e,t=d.searchParams.get("fmt"),n=d.searchParams.get("format"),l=d.searchParams.get("v"),r;try{let e=globalThis.$persistentStore?.read?.("${CACHE_KEY}"),t=new Map(JSON.parse(e||"[]"));r=t.get(l)}catch(e){a.warn("Official track cache read failed: "+e)}if(r?.englishUrl){let l=new d.constructor(r.englishUrl);t&&l.searchParams.set("fmt",t),n&&l.searchParams.set("format",n),e={url:l.toString(),headers:$request.headers}}else d.searchParams.set("lang",i.Playlists.Subtitle.get(l)||d.searchParams.get("lang")),d.searchParams.delete("tlang"),e={url:d.toString(),headers:$request.headers};x.push(e)}`;

let compositeSource = await download(SOURCES.composite);
compositeSource = replaceOnce(
  compositeSource,
  "let d=new o($request.url);",
  'let d=new o($request.url);if("Official"===d.searchParams.get("subtype")&&d.searchParams.get("dualsubs_tlang"))d.searchParams.set("tlang",d.searchParams.get("dualsubs_tlang"));',
  "Universal request URL setup",
);
compositeSource = replaceOnce(
  compositeSource,
  "a.logLevel=s.LogLevel;let f=d.searchParams?.get(\"subtype\")??s.Type",
  'a.logLevel=s.LogLevel;d.searchParams.get("dualsubs_tlang")&&(s.ShowOnly=!1,d.searchParams.delete("dualsubs_tlang"));let f=d.searchParams?.get("subtype")??s.Type',
  "Universal composite settings setup",
);
compositeSource = replaceOnce(
  compositeSource,
  compositeMarker,
  compositePatch,
  "Universal YouTube composite request",
);
compositeSource =
  "// Official Chinese-track preference patch for Egern. Based on DualSubs Universal.\n" +
  compositeSource;

await Promise.all([
  writeFile(OUTPUTS.request, requestSource, "utf8"),
  writeFile(OUTPUTS.response, responseSource, "utf8"),
  writeFile(OUTPUTS.composite, compositeSource, "utf8"),
]);

for (const output of Object.values(OUTPUTS)) console.log(output.pathname);
