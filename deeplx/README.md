# Egern DualSubs YouTube DeepLX

这个目录为 `🍿️ DualSubs: ▶️ YouTube` 增加原生 Egern DeepLX 配置：

- `DualSubs.YouTube.DeepLX.yaml`：Egern 模块，提供 `DeepLXEndpoint` 与可选的 `DeepLXToken` 参数。
- `Translate.response.deeplx.bundle.js`：基于 DualSubs Universal 当前发布包生成的翻译补丁。
- `patch_bundle.mjs`：重新下载上游发布包并注入 DeepLX 实现，同时隐藏初始化日志中的 API 密钥。
- `test_bundle.mjs`：模拟 Egern 与 DeepLX 响应的集成测试。

## 配置

在 Egern 的模块参数中设置：

- `Type`: `Translate`
- `Vendor`: `DeepLX`
- `DeepLXEndpoint`: DeepLX 根地址或完整的 `/translate` 地址
- `DeepLXToken`: `api.deeplx.org` 的 API Key，或其他服务的可选 Bearer Token

`api.deeplx.org` 可填写根地址并在 `DeepLXToken` 中填写 Key，也可直接填写完整的
`https://api.deeplx.org/<api-key>/translate` 并将 Token 留空。其他 DeepLX 服务会在
根地址后自动补上 `/translate`，并将 Token 作为 Bearer Token 发送。

## 构建与验证

```bash
node deeplx/patch_bundle.mjs
node --check deeplx/Translate.response.deeplx.bundle.js
node deeplx/test_bundle.mjs
```

模块使用 GitHub Raw 地址加载补丁脚本，发布后可直接在 Egern 中订阅：

`https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/deeplx/DualSubs.YouTube.DeepLX.yaml`
