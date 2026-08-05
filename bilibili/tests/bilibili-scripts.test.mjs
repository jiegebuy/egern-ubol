import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import feedMain, { filterFeed } from "../scripts/feed-filter.js";
import staticMain, { responseForUrl } from "../scripts/static-response.js";

test("extra feed filter removes BBZQ card types and title keywords", () => {
  const payload = {
    data: {
      items: [
        { title: "ordinary video", card_type: "small_cover_v2", card_goto: "av" },
        { title: "live", card_goto: "live", uri: "https://live.bilibili.com/1" },
        { title: "blocked sponsor", card_goto: "av" },
        { title: "course", card_goto: "ketang", uri: "/cheese/play/1" },
      ],
    },
  };
  filterFeed(payload, { filterTypes: "live,ketang", titleKeywords: "sponsor" });
  assert.deepEqual(payload.data.items.map((item) => item.title), ["ordinary video"]);
});

test("native feed script honors the module switch", async () => {
  const source = JSON.stringify({ data: { items: [{ title: "live", card_goto: "live" }] } });
  const disabled = await feedMain({
    env: { "Feed.Filter": "false", "Feed.FilterTypes": "live" },
    response: { text: async () => source },
  });
  assert.equal(disabled, undefined);

  const enabled = await feedMain({
    env: { "Feed.Filter": "true", "Feed.FilterTypes": "live" },
    response: { text: async () => source },
  });
  assert.deepEqual(JSON.parse(enabled.body).data.items, []);
});

test("pause-ad paths receive a successful empty response", () => {
  assert.deepEqual(
    responseForUrl("https://app.bilibili.com/x/player/pause_ad?aid=1"),
    { code: 0, message: "0", data: {} },
  );
  const result = staticMain({
    request: { url: "https://api.bilibili.com/x/v2/view/paused_page?aid=1" },
  });
  assert.equal(result.response.status, 200);
  assert.deepEqual(JSON.parse(result.response.body), { code: 0, message: "0", data: {} });
});

test("local response adapter preserves the original ADBlock map-local behavior", () => {
  const search = staticMain({
    request: { url: "https://api.vc.bilibili.com/search_svr/v1/Search/recommend_words" },
  });
  assert.deepEqual(JSON.parse(search.response.body), {});
});

test("Surge-compatible feed filter handles Egern legacy globals", () => {
  const source = fs.readFileSync(
    path.join(import.meta.dirname, "..", "scripts", "feed-filter.compat.js"),
    "utf8",
  );
  let completed;
  const response = {
    body: JSON.stringify({
      data: {
        items: [
          { title: "ordinary", card_goto: "av" },
          { title: "live", card_goto: "live" },
          { title: "blocked title", card_goto: "av" },
        ],
      },
    }),
  };
  vm.runInNewContext(source, {
    console,
    $argument: 'Feed.Filter="true"&Feed.FilterTypes="live"&Feed.TitleKeywords="blocked"',
    $response: response,
    $done: (value) => {
      completed = value;
    },
  });
  assert.deepEqual(JSON.parse(completed.body).data.items.map((item) => item.title), ["ordinary"]);
});

test("Surge-compatible share purifier expands short links and removes tracking", () => {
  const source = fs.readFileSync(
    path.join(import.meta.dirname, "..", "scripts", "share-link-purify.compat.js"),
    "utf8",
  );
  let completed;
  vm.runInNewContext(source, {
    URL,
    BigInt,
    console,
    $argument: 'Share.Purify="true"&Share.BV2AV="false"',
    $response: {
      body: JSON.stringify({
        code: 0,
        data: {
          content: "标题 https://b23.tv/AbCd123。",
          link: "https://www.bilibili.com/video/BV1GJ411x7h7?spm_id_from=333.1&p=2",
        },
      }),
    },
    $httpClient: {
      get(request, callback) {
        assert.equal(request.url, "https://b23.tv/AbCd123");
        assert.equal(request["auto-redirect"], false);
        callback(null, {
          status: 302,
          headers: {
            Location:
              "https://www.bilibili.com/video/BV1GJ411x7h7?share_source=copy_web&start_progress=65000#reply1",
          },
        });
      },
    },
    $done(value) {
      completed = value;
    },
  });

  const data = JSON.parse(completed.body).data;
  assert.equal(
    data.content,
    "标题 https://www.bilibili.com/video/BV1GJ411x7h7?start_progress=65000&t=65&unique_k=2333。",
  );
  assert.equal(
    data.link,
    "https://www.bilibili.com/video/BV1GJ411x7h7?p=2&unique_k=2333",
  );
});

test("Surge-compatible share purifier can apply BBZQ BV-to-av conversion", () => {
  const source = fs.readFileSync(
    path.join(import.meta.dirname, "..", "scripts", "share-link-purify.compat.js"),
    "utf8",
  );
  let completed;
  vm.runInNewContext(source, {
    URL,
    BigInt,
    console,
    $argument: 'Share.Purify="true"&Share.BV2AV="true"',
    $response: {
      body: JSON.stringify({
        code: 0,
        data: { content: "https://www.bilibili.com/video/BV1GJ411x7h7?from=share" },
      }),
    },
    $done(value) {
      completed = value;
    },
  });

  assert.equal(
    JSON.parse(completed.body).data.content,
    "https://www.bilibili.com/video/av80433022?unique_k=2333",
  );
});
