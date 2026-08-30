# Egern LiveDebug

这是一个面向 Egern/Surge 的只读网络诊断模块，服务于 Self-hosted LiveSync、DeepLX 等 HTTPS 排障。

Surge 版本：`Surge.LiveDebug.sgmodule`。它使用 Surge 原生 `$request`、`$response` 和 `$done()` API；Egern 版本使用 Egern 的 `ctx` API。两者都只观测，不重写流量。

## 它能做什么

- Egern 版本通过 `http_captures` 和 `http_request` / `http_response` 观察 `sync.caeluses.com` 与 `api.deeplx.org`。
- Surge 版本通过原生 `http-request` / `http-response` 脚本写入 Surge 日志，并保留 `$request.id` 供请求/响应关联。
- Egern 版本还提供 `Egern LiveDebug · 网络探针` 小组件；Surge 可使用内置 Dashboard 或 HTTP API 查看实时请求。

模块不会重写 URL、请求头或响应体，也不会读取或上传请求/响应正文。查询参数会被移除，避免把令牌、文档 ID 或用户内容写入日志。

## 安装

在 Egern 主配置的 `modules` 中加入：

```yaml
modules:
  - name: "Egern LiveDebug · 实时网络诊断"
    url: "https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/egern-debug/Egern.LiveDebug.yaml"
    enabled: true
```

然后重新加载配置。首次抓 HTTPS 流量前，需要在 Egern 中启用 MITM 并安装 CA 证书；如果只想使用小组件探针，可以不启用 MITM。

### Surge

导入：

```text
https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/egern-debug/Surge.LiveDebug.sgmodule
```

Surge 中需要在主配置的 `[General]` 手动开启 HTTP API（模块不会覆盖你的现有密钥）：

```ini
[General]
http-api = CHANGE_THIS_TO_A_RANDOM_KEY@127.0.0.1:6166
http-api-tls = false
http-api-web-dashboard = true
```

HTTP API 使用 `X-Key` 请求头认证。常用接口包括：

- `GET /v1/requests/recent`：最近请求
- `GET /v1/requests/active`：正在进行的请求
- `GET /v1/features/capture`：抓包开关状态
- `POST /v1/features/capture`：开启或关闭抓包
- `POST /v1/log/level`：调整日志级别

默认监听 `127.0.0.1` 只允许本机访问；如果改成 `0.0.0.0` 供局域网读取，必须使用随机长密钥并限制在可信局域网，不能暴露到公网。Surge 的 HTTP API 仍运行在 iOS 设备上，本对话不能自动访问 iOS 的 `127.0.0.1`；需要你在同一网络的电脑上访问 API，或把 API 返回的 JSON/截图发来。

## 如何把结果交给我分析

1. 打开 Egern 的 HTTP 抓包，访问一次目标功能。
2. 打开 Egern 日志，筛选 `Egern LiveDebug`。
3. 把对应时间段的请求、响应行贴出来；可以保留域名、路径、状态码和延迟，不要贴任何认证头或令牌。

`HTTP 401` 对没有携带 CouchDB 凭据的根路径探测是正常的，说明 DNS、TLS、路由和服务器均已响应；真正的认证请求应结合 LiveSync 的实际路径和状态判断。
