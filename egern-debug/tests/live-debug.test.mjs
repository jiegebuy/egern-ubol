import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const request = await import(pathToFileURL(path.join(root, "scripts", "live-debug-request.js")));
const response = await import(pathToFileURL(path.join(root, "scripts", "live-debug-response.js")));
const widget = await import(pathToFileURL(path.join(root, "scripts", "live-debug-widget.js")));

function headers(values) {
  return { get: (name) => values[name] || null };
}

test("request event removes query parameters and keeps safe headers", () => {
  const event = request.requestEvent({
    request: {
      method: "POST",
      url: "https://sync.caeluses.com/_bulk_docs?token=secret&doc=private",
      headers: headers({ "content-type": "application/json", authorization: "Bearer secret" }),
    },
  }, "2026-08-30T13:00:00.000Z");
  assert.equal(event.url, "https://sync.caeluses.com/_bulk_docs");
  assert.deepEqual(event.headers, { "content-type": "application/json" });
});

test("response event records status without consuming the body", () => {
  const event = response.responseEvent({
    request: { method: "GET", url: "https://api.deeplx.org/translate?key=secret" },
    response: { status: 401, headers: headers({ "www-authenticate": "Basic" }) },
  }, "2026-08-30T13:00:01.000Z");
  assert.equal(event.status, 401);
  assert.equal(event.url, "https://api.deeplx.org/translate");
  assert.equal(event.headers["www-authenticate"], "Basic");
});

test("widget renders probe status and latency", () => {
  const output = widget.renderProbeWidget([
    { url: "https://sync.caeluses.com/", host: "sync.caeluses.com", status: 401, latency: 42, error: null },
    { url: "https://api.deeplx.org/", host: "api.deeplx.org", status: 0, latency: 5000, error: "timeout" },
  ]);
  assert.equal(output.type, "widget");
  assert.match(JSON.stringify(output), /HTTP 401/);
  assert.match(JSON.stringify(output), /timeout/);
});
