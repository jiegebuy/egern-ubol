# Egern DualSubs YouTube DeepLX / Gemini

这个目录为 `🍿️ DualSubs: ▶️ YouTube` 增加原生 Egern DeepLX 与 Gemini AI Studio 配置：

- `DualSubs.YouTube.DeepLX.yaml`：Egern 模块，提供 DeepLX 与 Gemini 参数。
- `Translate.response.deeplx.bundle.js`：基于 DualSubs Universal v1.7.5 生成的翻译补丁。
- `YouTube.*.official.bundle.js`：缓存 YouTube 自带的英/中字幕轨道，并自动选择官方合成或机器翻译。
- `Composite.Subtitles.response.official.bundle.js`：使用真实英文与中文轨道合成双语字幕。
- `patch_bundle.mjs`：下载固定的上游发布包并注入 DeepLX 与 YouTube XML 兼容实现，同时隐藏初始化日志中的 API 密钥。
- `patch_youtube_official.mjs`：从固定的 DualSubs 版本生成官方字幕优先补丁。
- `test_bundle.mjs`：模拟 Egern 与 DeepLX 响应的集成测试。
- `test_youtube_official.mjs`：验证简体优先、繁体回退、无中文时翻译以及官方双轨合成。
- `replay_youtube.mjs`：按 Egern 的 player 请求、player 响应、timedtext 请求和翻译响应顺序回放真实 YouTube 视频。

## 配置

在 Egern 的模块参数中设置：

- `Type`: `Translate`
- `Vendor`: `DeepLX`
- `DeepLXEndpoint`: DeepLX 根地址或完整的 `/translate` 地址
- `DeepLXToken`: `api.deeplx.org` 的 API Key，或其他服务的可选 Bearer Token
- `GeminiAPIKey`: Google AI Studio API Key
- `GeminiModel`: Gemini 模型 ID，默认 `gemini-3.7-flash`

`api.deeplx.org` 可填写根地址并在 `DeepLXToken` 中填写 Key，也可直接填写完整的
`https://api.deeplx.org/<api-key>/translate` 并将 Token 留空。其他 DeepLX 服务会在
根地址后自动补上 `/translate`，并将 Token 作为 Bearer Token 发送。

使用 Gemini 时将 `Vendor` 设为 `Gemini`，填写 `GeminiAPIKey`。请求通过
`x-goog-api-key` 发送密钥，并使用结构化 JSON 数组保证字幕顺序与数量一致；
`GeminiModel` 可改为 AI Studio Key 有权限调用的其他文本生成模型。

## 官方中文字幕优先

播放器响应包含英文和自带中文字幕时，模块不会调用 DeepLX 或 Gemini，而会直接合成
两条真实字幕轨道。选择顺序是：

1. 英文 + 简体中文（`zh`、`zh-Hans`、`zh-CN`）
2. 英文 + 繁体中文（`zh-Hant`、`zh-TW`、`zh-HK`）
3. 没有自带中文字幕时，继续使用所配置的 DeepLX 或 Gemini 翻译

`CK38RHLvZEc` 的播放器响应同时包含 `en`、`zh` 和 `zh-Hant`，因此会选择 `en + zh`
官方合成，不会发出机器翻译请求。

批量字幕使用 DeepLX 可稳定保留的换行分段。补丁也兼容 YouTube iOS 返回的
`<transcript><text>` XML 字幕格式。

DeepLX 返回 HTTP/API `429` 时，补丁会立即停止重试并放行原字幕，避免字幕请求
因指数退避超过 YouTube 的等待时间。

## 构建与验证

```bash
node deeplx/patch_bundle.mjs
node deeplx/patch_youtube_official.mjs
node --check deeplx/Translate.response.deeplx.bundle.js
node deeplx/test_bundle.mjs
node deeplx/test_bundle_rate_limit.mjs
node deeplx/test_bundle_gemini.mjs
node deeplx/test_youtube_official.mjs
```

可用真实示例视频执行不调用翻译器的在线回放：

```bash
node deeplx/test_youtube_official.mjs --live
```

真实视频回放需要通过环境变量提供完整 Endpoint，例如：

```bash
DEEPLX_ENDPOINT='https://api.deeplx.org/<api-key>/translate' \
  node deeplx/replay_youtube.mjs -IhuFgiWNS4
```

模块使用 GitHub Raw 地址加载补丁脚本，发布后可直接在 Egern 中订阅：

`https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/deeplx/DualSubs.YouTube.DeepLX.yaml`
