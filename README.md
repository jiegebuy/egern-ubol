# Track Block Lite for Egern

把 uBlock Origin Lite 官方 Chromium 规则转换为 Egern 可用的原生网络规则。当前推荐入口是一个专注于跨应用追踪器拦截的轻量模块；浏览器内的广告和网页元素隐藏交给 uBO Lite 自己处理。

## BiliBili 模块

基于 BiliUniverse ADBlock / Enhanced 的 Egern 适配，以及 BBZQ 可在网络层实现的补充功能，见 [`bilibili/README.md`](bilibili/README.md)。其中 ADBlock 模块包含独立的暂停广告拦截、首页卡片类型过滤和标题关键词过滤。

## 推荐模块

`https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/dist/track-block/ubol.yaml`

**Track Block Lite** 只采用官方 uBO Lite 内置的 **Peter Lowe – Ads, trackers, and more**：

- 当前约 3,430 条域名规则，规则文件约 78 KB。
- 仅使用 Egern 原生域名拦截，不读取网页响应正文。
- 不包含 MITM、脚本、URL 正则、CSS 注入、恶意网址或地区列表。
- 没有冗余的列表开关；启用或禁用模块就是总开关。
- 仅保留一个可选参数 `拦截策略`，默认使用 `REJECT`。

Peter Lowe 比 EasyPrivacy 更适合作为轻量底座：当前 EasyPrivacy 转换后约 42,669 个域名、规则文件约 1.2 MB，而 Peter Lowe 覆盖常见广告和追踪基础设施的同时，解析量小得多。

不要同时启用 Track Block Lite 与本仓库的旧规则模块，以免重复加载相同域名。

## 旧实验版本

以下产物保留用于兼容已有链接，不再作为推荐安装：

- `dist/memory-safe`：56 个可配置列表，仅生成域名/IP 和查询参数清理。
- `dist/full`：额外包含 URL 正则和站点专用 CSS 响应脚本。

## 转换边界

轻量模块只承接无需请求上下文的域名/IP 拦截。依赖第一方/第三方、资源类型、请求方法、响应头、浏览器 scriptlet 或网页 DOM 的规则不会被放入 Track Block Lite。

## 官方更新

转换器每天从 `uBlockOrigin/uBOL-home` 的最新官方 GitHub Release 下载 Chromium ZIP，校验 GitHub 提供的 SHA-256 后重新生成模块。只有官方版本或转换结果发生变化时，GitHub Actions 才会提交更新；Egern 端的模块和规则集更新间隔均为 24 小时。

本地生成推荐模块：

```bash
python scripts/update.py --latest \
  --dist dist/track-block \
  --selection config/track-block.json \
  --base-url https://raw.githubusercontent.com/OWNER/REPO/main/dist/track-block
```

验证：

```bash
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -p "test_*.py"
npm test
```

生成数据来自 uBO Lite 及其上游过滤列表，版权和许可仍归各上游项目与列表维护者所有。
