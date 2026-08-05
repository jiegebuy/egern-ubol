# BiliBili + BBZQ for Egern

这里提供两个基于 Surge `.sgmodule` 的模块，Egern 可以直接导入；两个模块建议同时启用：

- `BiliBili.ADBlock.sgmodule`：广告、运营卡片、弹幕、评论广告和已知暂停广告网络请求净化。
- `BiliBili.Enhanced.sgmodule`：首页标签、顶栏、底栏、分区、“我的”页面定制和分享短链净化。

直接导入：

- `https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/bilibili/BiliBili.ADBlock.sgmodule`
- `https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/bilibili/BiliBili.Enhanced.sgmodule`

仓库内的 `.yaml` 文件是早期 Egern 原生格式实验版；如果 Egern 提示 YAML 格式不正确，请使用上面两个 `.sgmodule` 地址。

模块直接调用 BiliUniverse 最新 Release 的脚本，并补充 BBZQ 中能在网络层可靠实现的功能。首次启用 MITM 后，需要在 iOS 系统设置中安装并信任 Egern 证书，然后强制退出并重新打开哔哩哔哩。

## 暂停广告

暂停广告的网络层拦截是 ADBlock Surge 模块的固定功能：

1. 直接拒绝哔哩哔哩广告配置域名 `cm.bilibili.com` 和 `cm.biliapi.net`。
2. 对 API 中路径明确含有 `pause`、`paused`、`pause_page`、`pausedpage`、`pause_ad` 或 `ad_pause` 的 JSON 请求返回成功空数据，避免客户端因请求失败回退到广告面板。
3. 拒绝 gRPC 中名称明确包含上述特征的暂停页服务请求；匹配不区分大小写，因此覆盖 `RequestPausedPage` 一类服务名。

这不是 BBZQ 暂停广告功能的完整迁移。BBZQ 原版通过 Xposed 在应用进程内同时拦截 `requestPausedPage()`、`getPausedPagePanel()` 和 `getBrandPausedPagePanel()`，直接阻止暂停广告面板创建；Egern 不能 Hook Android 对象或隐藏客户端 View，只能处理实际经过代理的请求。若新版客户端使用名称不含上述特征的接口、已缓存广告或本地创建面板，仍可能出现暂停广告，需要用 Egern HTTP 抓包提供暂停瞬间新增的请求 URL 后才能继续补规则。

## 分享短链净化

`BiliBili.Enhanced.sgmodule` 默认拦截标准“分享 → 复制链接”接口 `/x/share/click`，按 BBZQ 的规则处理响应中的 `b23.tv` 与 `bili2233.cn`：

1. 展开短链到 `bilibili.com` 原始链接。
2. 清除分享追踪参数和 fragment，仅保留分 P 参数 `p`、时间参数 `t`；若有 `start_progress`，同时换算秒级 `t`。
3. 添加 BBZQ 标记 `unique_k=2333`。

模块参数 `Share.Purify` 控制净化开关，默认开启；`Share.BV2AV` 可选将 BV 号转换为 av 号，默认关闭。此实现覆盖客户端通过标准分享 API 生成的复制链接；不经过该接口、完全由客户端本地拼接的分享文本仍不在网络代理的修改范围内。

## 已迁移功能

- 开屏、推荐流、短视频流、搜索、番剧、直播、动态、视频详情、弹幕和评论广告净化。
- 青少年模式提示数据清理。
- 首页图文、游戏、直播、课堂、竖屏、大卡片以及标题关键词过滤。
- 首页标签、顶部/底部入口、分区和“我的”页面定制。
- 已知暂停广告网络请求与广告配置域名拦截（不等同于 BBZQ 的客户端 Hook）。
- 标准“分享 → 复制链接”的 `b23.tv` / `bili2233.cn` 展开与追踪参数净化。

## 无法由 Egern 原样迁移

以下 BBZQ 功能依赖 Android/Xposed 的进程内对象、播放器或 View 层，网络代理没有等价执行点：

- SponsorBlock 自动 seek、进度条标记、自动点赞、三倍速和播放器状态栏/按钮修改。
- 长按自由复制、分享面板 UI/渠道行为、主题皮肤、下载线程数和 App 设置入口。
- 动态页自动切换标签、任意 View 组件隐藏、完整数字的客户端格式化。
- 自动完成激励广告、读取 access key，以及 ReadEra/Wo Mic 的跨应用 Hook。

这些项目不会放置“看起来可配置、实际无效”的开关。

## 本地验证

```bash
python -m unittest discover -s tests -p "test_*.py"
npm test
```

上游版权和许可归 BBZQ、BiliUniverse 及各自维护者所有；本仓库只提供 Egern 配置、适配脚本和必要的来源说明。
