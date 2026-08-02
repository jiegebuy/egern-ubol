import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const UPSTREAM_URL =
  "https://github.com/DualSubs/Universal/releases/latest/download/Translate.response.bundle.js";
const OUTPUT_URL = new URL("./Translate.response.deeplx.bundle.js", import.meta.url);

const marker = "}async BaiduFanyi(";
const deepLXMethod = String.raw`}async DeepLX(e=[],t=this.Source,a=this.Target,n=this.API){e=Array.isArray(e)?e:[e],t=this.#T.DeepL[t]??this.#T.DeepL[t?.split?.(/[-_]/)?.[0]]??t?.toUpperCase?.(),a=this.#T.DeepL[a]??this.#T.DeepL[a?.split?.(/[-_]/)?.[0]]??a?.toUpperCase?.();let s=String(n?.Endpoint??"").trim();if(!s)throw new Error("DeepLX Endpoint is required");const i=String(n?.Token??n?.Key??n?.Auth??"").trim(),o=/^https?:\/\/api\.deeplx\.org(?=\/|$)/i.test(s);if(o){const e=new URL(s),t=e.pathname.split("/").filter(Boolean),a="translate"===t[t.length-1]?.toLowerCase()&&t.length>1;if(!a){if(!i)throw new Error("DeepLX API key is required for api.deeplx.org");e.pathname="/"+encodeURIComponent(i)+"/translate",e.search="",e.hash="",s=e.toString()}}else /\/translate(?:[?#]|$)/i.test(s)||(s=s.replace(/\/+$/,"")+"/translate");const c="\uE000\uE001\uE000",r={url:s,headers:{Accept:"application/json","User-Agent":"DualSubs","Content-Type":"application/json"},body:JSON.stringify({text:e.join(c),source_lang:t||"auto",target_lang:a})};return i&&!o&&(r.headers.Authorization="Bearer "+i),await l(r).then(t=>{if(Number(t?.statusCode??t?.status)>=400)throw new Error("DeepLX HTTP "+(t.statusCode??t.status));const n=JSON.parse(t.body);if(void 0!==n?.code&&200!==Number(n.code))throw new Error("DeepLX API "+n.code+": "+(n?.message??n?.msg??"request failed"));const s=n?.data??n?.translation??n?.translations;if(Array.isArray(s))return s.map(e=>"string"==typeof e?e:e?.text??e?.translation??"");if("string"!=typeof s)throw new Error("DeepLX response does not contain translated text");const r=s.split(c).map(e=>e.trim());if(1===e.length)return[s];if(r.length!==e.length)throw new Error("DeepLX returned "+r.length+" segments for "+e.length+" inputs");return r}).catch(e=>Promise.reject(e))}async BaiduFanyi(`;

const response = await fetch(UPSTREAM_URL, { redirect: "follow" });
if (!response.ok) {
  throw new Error(`Unable to download DualSubs translator: HTTP ${response.status}`);
}

const upstream = await response.text();
const occurrences = upstream.split(marker).length - 1;
if (occurrences !== 1) {
  throw new Error(`Expected one translator patch marker, found ${occurrences}`);
}
if (upstream.includes("async DeepLX(")) {
  throw new Error("Upstream already implements DeepLX; review this patch before rebuilding");
}

const settingsLog =
  'r.info(`typeof Settings: ${typeof n}`,`Settings: ${JSON.stringify(n,null,2)}`)';
const settingsLogOccurrences = upstream.split(settingsLog).length - 1;
if (settingsLogOccurrences !== 1) {
  throw new Error(
    `Expected one sensitive settings log marker, found ${settingsLogOccurrences}`,
  );
}

const notice =
  "// DeepLX support patch for Egern. Based on DualSubs Universal (Apache-2.0).\n";
const patched =
  notice +
  upstream
    .replace(marker, deepLXMethod)
    .replace(
      settingsLog,
      'r.info(`typeof Settings: ${typeof n}`,"Settings loaded; sensitive API values are hidden")',
    );

await mkdir(fileURLToPath(new URL(".", import.meta.url)), { recursive: true });
await writeFile(OUTPUT_URL, patched, "utf8");
console.log(fileURLToPath(OUTPUT_URL));
