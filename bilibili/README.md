# BiliBili + BBZQ for Egern

这里提供两个基于 Surge `.sgmodule` 的模块，Egern 可以直接导入；两个模块建议同时启用：

- `BiliBili.ADBlock.sgmodule`：广告、运营卡片、弹幕、评论广告和暂停广告净化。
- `BiliBili.Enhanced.sgmodule`：首页标签、顶栏、底栏、分区和“我的”页面定制。

直接导入：

- `https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/bilibili/BiliBili.ADBlock.sgmodule`
- `https://raw.githubusercontent.com/jiegebuy/egern-ubol/main/bilibili/BiliBili.Enhanced.sgmodule`

仓库内的 `.yaml` 文件是早期 Egern 原生格式实验版；如果 Egern 提示 YAML 格式不正确，请使用上面两个 `.sgmodule` 地址。

模块直接调用 BiliUniverse 最新 Release 的脚本，并补充 BBZQ 中能在网络层可靠实现的功能。首次启用 MITM 后，需要在 iOS 系统设置中安装并信任 Egern 证书，然后强制退出并重新打开哔哩哔哩。

## 暂停广告

暂停广告拦截是 ADBlock Surge 模块的固定功能，采用两层拦截：

1. 直接拒绝哔哩哔哩广告配置域名 `cm.bilibili.com` 和 `cm.biliapi.net`。
2. 拒绝 Bili API 中路径明确含有 `pause`、`paused`、`pause_page`、`pausedpage`、`pause_ad` 或 `ad_pause` 的暂停页广告请求。

BBZQ 原版通过 Xposed 在应用进程内拦截 `requestPausedPage()` 并令暂停广告面板返回 `null`。Egern 无法调用 Android 方法，因此网络版只能拦截实际发出的广告请求；如果新版客户端改用不含上述特征的新端点，需要先用 Egern HTTP 抓包确认 URL，再补充规则。

## 已迁移功能

- 开屏、推荐流、短视频流、搜索、番剧、直播、动态、视频详情、弹幕和评论广告净化。
- 青少年模式提示数据清理。
- 首页图文、游戏、直播、课堂、竖屏、大卡片以及标题关键词过滤。
- 首页标签、顶部/底部入口、分区和“我的”页面定制。
- 暂停广告请求与广告配置域名拦截。

## 无法由 Egern 原样迁移

以下 BBZQ 功能依赖 Android/Xposed 的进程内对象、播放器或 View 层，网络代理没有等价执行点：

- SponsorBlock 自动 seek、进度条标记、自动点赞、三倍速和播放器状态栏/按钮修改。
- 长按自由复制、分享面板行为、主题皮肤、下载线程数和 App 设置入口。
- 动态页自动切换标签、任意 View 组件隐藏、完整数字的客户端格式化。
- 自动完成激励广告、读取 access key，以及 ReadEra/Wo Mic 的跨应用 Hook。

这些项目不会放置“看起来可配置、实际无效”的开关。

## 本地验证

```bash
python -m unittest discover -s tests -p "test_*.py"
npm test
```

上游版权和许可归 BBZQ、BiliUniverse 及各自维护者所有；本仓库只提供 Egern 配置、适配脚本和必要的来源说明。
