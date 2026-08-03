# CLI Proxy API 配额小组件

通过 CLIProxyAPI 管理接口读取 Codex OAuth 凭证，并在 Egern 的主屏幕/锁屏小组件中显示剩余配额、套餐与重置时间。

## 安装

在 Egern 的 **工具 → 模块 → +** 中添加：

```text
https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/cli-proxy-api-quota/CLIProxyAPI.Quota.yaml
```

然后编辑模块 Env：

- `API_URL`：CLIProxyAPI 根地址，例如 `http://192.168.1.10:8317`。也可直接粘贴 `management.html#/quota` 的完整地址。
- `MANAGEMENT_KEY`：CLIProxyAPI 的 `remote-management.secret-key`，必填。
- `ACCOUNT_FILTER`：可选，按文件名或邮箱筛选账号。
- `MAX_ACCOUNTS`：大组件最多加载 1–4 个账号。
- `MASK_EMAIL`：默认 `true`，隐藏邮箱用户名中间部分。
- `AUTO_REFRESH_MINUTES`：自动刷新间隔（分钟）。默认 `0`，仅手动刷新；填写正整数后启用定时自动刷新，例如 `30` 表示每 30 分钟刷新。

最后进入 **分析 → 小组件画廊 → 模块小组件**，选择“CLI Proxy API 配额”，再将 Egern 小组件添加到 iOS 主屏幕或锁屏。

> `localhost` 指小组件所在的 iPhone/iPad。CLIProxyAPI 若运行在电脑或 NAS 上，请填写该设备可从 iPhone 访问的局域网地址，并确保 CLIProxyAPI 允许远程管理。HTTP 地址还需满足 iOS/Egern 的网络访问策略；条件允许时推荐使用 HTTPS。

## 数据与安全

模块使用的链路与 CLIProxyAPI Management Center 一致：

1. `GET /v0/management/auth-files` 获取 Codex 凭证与 `auth_index`。
2. `POST /v0/management/api-call` 由 CLIProxyAPI 代取 `https://chatgpt.com/backend-api/wham/usage`。

管理密钥仅从 Egern 模块 Env 读取，并仅发送至你配置的 CLIProxyAPI 管理接口。脚本不会读取或展示 OAuth access token，也不会把密钥写入持久化存储。

## 显示规则

- `AUTO_REFRESH_MINUTES` 为 `0` 时，小组件只在手动刷新时重新请求配额；设置为正整数时，将按所填分钟数自动刷新。实际执行时间可能受 iOS 小组件调度策略影响。
- 环形和进度条显示的是**剩余额度**，不是已使用比例。
- 有周期额度时优先将其作为账号主指标，否则使用 5 小时额度。
- 颜色阈值：剩余 ≥ 50% 为绿色，20–49% 为橙色，低于 20% 为红色。
- 中尺寸和大尺寸最多显示 2 个账号；超大尺寸使用双列布局，最多显示 4 个。
