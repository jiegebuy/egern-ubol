# Obsidian LiveDebug

用于在 Obsidian iOS 前台运行时，通过 iOS 插件主动建立 WSS 连接，再由受控 HTTP API 读取诊断信息。

## 安全模型

- 设备令牌仅通过 WebSocket 子协议发送，不出现在 URL 或普通日志中。
- 控制端使用独立 Bearer 令牌。
- 不提供任意 JavaScript 执行，不读取笔记正文、凭据或 LiveSync 加密数据。
- `commands.execute` 与 `plugin.reload` 只有在 iOS 设置中开启“允许受控操作”后才可用。
- 事件与日志只保存在内存，服务重启即清空。

## RPC

`system.ping`、`diagnostics.snapshot`、`plugins.list`、`plugin.inspect`、`logs.tail`、`events.tail`、`vault.summary` 为只读诊断；`commands.execute`、`plugin.reload` 为显式授权动作。

## 部署概要

在 VPS 创建 Python 3.9 虚拟环境并安装 `relay/requirements.txt`，生成 `/etc/obsidian-live-debug.env`（权限 0600），使用 `deploy/obsidian-live-debug.service` 运行。将 `deploy/nginx-location.conf` 的 location 合并到现有 HTTPS server 后执行 nginx 配置检查与 reload。

控制端示例：

```bash
curl -H 'Authorization: Bearer <CONTROL_TOKEN>' https://sync.example.com/obsidian-debug/api/v1/devices
curl -H 'Authorization: Bearer <CONTROL_TOKEN>' -H 'Content-Type: application/json' \\
  -d '{"method":"diagnostics.snapshot"}' \\
  https://sync.example.com/obsidian-debug/api/v1/devices/<DEVICE_ID>/rpc
```
