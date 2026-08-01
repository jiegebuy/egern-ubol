# uBO Lite rules for Egern

把 uBlock Origin Lite 官方 Chromium 规则转换为一个 Egern 模块。模块内有 56 个布尔参数，分别控制 uBOL 设置页中的 56 个过滤列表，不会生成 56 个独立模块。

## 两个测试版本

- **Memory Safe（推荐）**：域名/IP 规则和安全可转换的 URL 去跟踪参数。省略路径级 URL 正则与网页元素隐藏，降低 iOS Network Extension 的解析峰值和常驻内存。
- **Full URL + CSS（压力测试）**：在相同内容上额外加入可安全转换的路径级 URL 正则，以及官方列表中的站点专用纯 CSS 元素隐藏规则。当前版本有 42,812 条 URL 正则；通用 CSS、程序化选择器和 scriptlet 仍无法由 Egern 等价执行。

发布后的模块入口：

- `https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/dist/memory-safe/ubol.yaml`
- `https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/dist/full/ubol.yaml`

模块参数使用 `DISABLE_*` 命名，因为它们直接替换 Egern 规则和脚本的 `disabled` 字段：

- `false`：启用该列表
- `true`：禁用该列表

默认启用 `uBlock filters`、`EasyList`、`EasyPrivacy`、`Peter Lowe`、`URL Tracking Protection`、`Badware risks`、`Malicious URL Blocklist`、`AI Widgets` 和 `AdGuard Chinese`，与本机选择一致。

## 内存说明

Memory Safe 的全部静态产物约 4.2 MB；Full URL + CSS 的全量静态产物约 14.1 MB，其中当前默认列表实际启用 6 个 CSS 脚本，合计约 1.13 MB、22,657 条站点专用选择器。CSS 响应脚本只在目标站点命中规则且响应为 HTML 时读取正文，单个响应上限为 1 MB。

磁盘大小不能直接等同于 Egern 扩展进程的常驻内存，因此无法在 Windows 上承诺低于 iOS 的 50 MB 限制。建议先测 Memory Safe，再单独测 Full URL + CSS；不要同时启用两个版本。

模块不会自动加入 `mitm.hostnames: ["*"]`。Full 版只自动加入 `iplark.com` 与 `*.iplark.com`，用于修复该站由 AdGuard 中文列表提供的 4 条元素隐藏规则；其他 HTTPS 网站只有在 Egern 主配置已覆盖对应 MITM 主机时才会注入 CSS。可通过模块设置里的 `Safari 网页元素隐藏` 总开关关闭这类响应脚本。

域名/IP 拦截不需要 MITM。URL 去参数脚本只会在 Egern 能看到完整 HTTPS URL 的主机上生效，可通过 `URL 查询参数清理` 总开关关闭。

## 转换边界

Egern 能原生承接无请求上下文的域名、IP 和 URL 规则。Full 版还能通过修改 HTML 响应注入站点专用纯 CSS。以下浏览器能力仍无法安全一比一转换，因此不会假装支持：

- 通用元素隐藏、程序化选择器、scriptlet 和弹窗处理
- 依赖发起方、第一方/第三方、资源类型、方法或响应头的规则
- 重定向到扩展内置空资源和 Header 修改
- uBOL 的 strict-block 提示页面（其中纯恶意域名会转为 `REJECT`）

每个列表的输入、输出和跳过原因都在对应版本的 `metadata.json` 中。

## 官方更新

转换器从 `uBlockOrigin/uBOL-home` 的最新官方 GitHub Release 下载 Chromium ZIP，校验 GitHub 提供的 SHA-256 后生成两个版本。GitHub Actions 每天检查一次并只在官方版本或规则变化时提交。

本地生成：

```bash
python scripts/update.py --latest \
  --dist dist/memory-safe \
  --base-url https://raw.githubusercontent.com/OWNER/REPO/main/dist/memory-safe

python scripts/update.py --latest \
  --dist dist/full \
  --base-url https://raw.githubusercontent.com/OWNER/REPO/main/dist/full \
  --include-url-regex \
  --include-specific-css
```

验证：

```bash
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -p "test_*.py"
npm test
```

生成数据来自 uBO Lite 及其上游过滤列表，版权和许可仍归各上游项目与列表维护者所有。
