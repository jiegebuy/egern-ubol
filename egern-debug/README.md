# Egern LiveDebug

这是一个面向 Egern 的只读网络诊断模块，服务于 Self-hosted LiveSync、DeepLX 等 HTTPS 排障。

## 它能做什么

- `http_captures`：在 Egern 的 HTTP 抓包界面观察 `sync.caeluses.com` 与 `api.deeplx.org` 的实际请求。
- `http_request` / `http_response`：把脱敏后的方法、URL（去掉查询参数）、状态码和少量响应头写入 Egern 日志。
- `Egern LiveDebug · 网络探针`：通过小组件手动或定时探测两个地址，显示 HTTP 状态和延迟。

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

## 如何把结果交给我分析

1. 打开 Egern 的 HTTP 抓包，访问一次目标功能。
2. 打开 Egern 日志，筛选 `Egern LiveDebug`。
3. 把对应时间段的请求、响应行贴出来；可以保留域名、路径、状态码和延迟，不要贴任何认证头或令牌。

`HTTP 401` 对没有携带 CouchDB 凭据的根路径探测是正常的，说明 DNS、TLS、路由和服务器均已响应；真正的认证请求应结合 LiveSync 的实际路径和状态判断。
