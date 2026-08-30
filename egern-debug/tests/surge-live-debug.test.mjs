import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

function run(file, globals) {
  const source = fs.readFileSync(path.join(root, "scripts", file), "utf8");
  vm.runInNewContext(source, {
    URL,
    Date,
    console,
    ...globals,
  });
}

test("Surge request script logs a redacted request and leaves it untouched", () => {
  const logs = [];
  let doneValue;
  run("surge-live-debug-request.js", {
    console: { log: (value) => logs.push(value) },
    $request: {
      id: "req-1",
      method: "POST",
      url: "https://sync.caeluses.com/obsidiannotes/_all_docs?secret=1",
      headers: { "Content-Type": "application/json", Authorization: "Bearer secret" },
    },
    $done: (value) => { doneValue = value; },
  });
  assert.equal(JSON.stringify(doneValue), "{}");
  assert.match(logs[0], /sync\.caeluses\.com/u);
  assert.match(logs[0], /_all_docs"/u);
  assert.doesNotMatch(logs[0], /secret/u);
});

test("Surge response script logs status and notifies only when enabled", () => {
  const logs = [];
  const notifications = [];
  let doneValue;
  run("surge-live-debug-response.js", {
    console: { log: (value) => logs.push(value) },
    $request: { id: "req-2", method: "GET", url: "https://api.deeplx.org/translate?key=secret", headers: {} },
    $response: { status: 502, headers: { Server: "nginx" } },
    $argument: "NOTIFY_ERRORS=true",
    $notification: { post: (...args) => notifications.push(args) },
    $done: (value) => { doneValue = value; },
  });
  assert.equal(JSON.stringify(doneValue), "{}");
  assert.match(logs[0], /"status":502/u);
  assert.doesNotMatch(logs[0], /secret/u);
  assert.equal(notifications.length, 1);
});
