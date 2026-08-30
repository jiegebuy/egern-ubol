const { Plugin, PluginSettingTab, Setting, Notice, Platform, requestUrl } = require("obsidian");

const DEFAULT_SETTINGS = {
  relayUrl: "wss://sync.caeluses.com/obsidian-debug/ws/device",
  deviceId: "",
  deviceToken: "",
  autoConnect: false,
  allowControlledActions: false,
  captureConsole: false,
  allowedCommandIds: [],
  allowedProbeHosts: ["sync.caeluses.com"],
  eventBufferSize: 200
};

function safeError(error) {
  return { name: error?.name || "Error", message: String(error?.message || error).slice(0, 500) };
}

class LiveDebugPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!this.settings.deviceId) this.settings.deviceId = this.makeDeviceId();
    this.events = [];
    this.logs = [];
    this.rpcHandlers = new Map();
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.foreground = true;

    this.registerRpcHandlers();
    this.registerEvents();
    this.addSettingTab(new LiveDebugSettingTab(this.app, this));
    this.addCommand({ id: "connect", name: "LiveDebug: connect", callback: () => this.connect() });
    this.addCommand({ id: "disconnect", name: "LiveDebug: disconnect", callback: () => this.disconnect() });
    this.addCommand({ id: "snapshot", name: "LiveDebug: copy diagnostics snapshot", callback: () => this.copySnapshot() });

    if (this.settings.captureConsole) this.installConsoleCapture();
    if (this.settings.autoConnect && this.settings.deviceToken) this.connect();
    this.emitEvent("plugin.loaded", { platform: Platform.isMobile ? "mobile" : "desktop" });
  }

  onunload() { this.disconnect(); if (this.restoreConsole) this.restoreConsole(); }

  makeDeviceId() {
    const raw = `${Platform.isMobile ? "mobile" : "desktop"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return raw.toLowerCase();
  }

  async saveSettings() { await this.saveData(this.settings); }

  registerEvents() {
    this.registerEvent(this.app.workspace.on("active-leaf-change", leaf => this.emitEvent("workspace.active_leaf", { type: leaf?.view?.getViewType?.() || null })));
    this.registerEvent(this.app.vault.on("create", file => this.emitEvent("vault.create", { path: file.path, extension: file.extension })));
    this.registerEvent(this.app.vault.on("modify", file => this.emitEvent("vault.modify", { path: file.path, extension: file.extension })));
    this.registerEvent(this.app.vault.on("delete", file => this.emitEvent("vault.delete", { path: file.path, extension: file.extension })));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => this.emitEvent("vault.rename", { oldPath, path: file.path })));
    document.addEventListener("visibilitychange", this.visibilityHandler = () => {
      this.foreground = document.visibilityState === "visible";
      this.emitEvent("app.visibility", { foreground: this.foreground });
    });
    this.register(() => document.removeEventListener("visibilitychange", this.visibilityHandler));
  }

  installConsoleCapture() {
    const original = { log: console.log, warn: console.warn, error: console.error };
    ["log", "warn", "error"].forEach(level => {
      console[level] = (...args) => {
        this.logs.push({ at: new Date().toISOString(), level, message: args.map(a => typeof a === "string" ? a : "[object]").join(" ").slice(0, 500) });
        if (this.logs.length > 500) this.logs.shift();
        original[level](...args);
      };
    });
    this.restoreConsole = () => ["log", "warn", "error"].forEach(level => { console[level] = original[level]; });
  }

  emitEvent(type, data) {
    const event = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), type, data };
    this.events.push(event);
    if (this.events.length > Math.max(20, Number(this.settings.eventBufferSize) || 200)) this.events.shift();
    if (this.ws?.readyState === WebSocket.OPEN) this.send({ type: "event", event });
  }

  send(message) { try { this.ws.send(JSON.stringify(message)); } catch (e) { this.logs.push({ at: new Date().toISOString(), level: "error", message: safeError(e).message }); } }

  connect() {
    if (!this.settings.relayUrl || !this.settings.deviceToken) { new Notice("LiveDebug: 请先填写中继地址和设备令牌"); return; }
    this.disconnect(false);
    try {
      this.ws = new WebSocket(this.settings.relayUrl, ["obsidian-livedebug-v1", `device-token.${this.settings.deviceToken}`]);
      this.ws.onopen = () => { this.reconnectAttempt = 0; this.send({ type: "hello", deviceId: this.settings.deviceId, client: this.clientInfo() }); this.emitEvent("connection.open", {}); };
      this.ws.onmessage = event => this.handleMessage(event.data);
      this.ws.onerror = () => this.logs.push({ at: new Date().toISOString(), level: "error", message: "WebSocket error" });
      this.ws.onclose = () => { this.ws = null; this.emitEvent("connection.close", {}); this.scheduleReconnect(); };
    } catch (e) { this.logs.push({ at: new Date().toISOString(), level: "error", message: safeError(e).message }); this.scheduleReconnect(); }
  }

  disconnect(schedule = true) { if (this.reconnectTimer) clearTimeout(this.reconnectTimer); this.reconnectTimer = null; if (this.ws) { this.ws.onclose = null; this.ws.close(); this.ws = null; } if (schedule) this.reconnectAttempt = 0; }
  scheduleReconnect() { if (!this.settings.autoConnect || this.reconnectTimer || !this.settings.deviceToken) return; const delay = Math.min(60000, 1000 * Math.pow(2, this.reconnectAttempt++)); this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.connect(); }, delay); }

  async handleMessage(raw) {
    let message; try { message = JSON.parse(raw); } catch (_) { return; }
    if (message.type !== "rpc" || !message.id || !message.method) return;
    try { const handler = this.rpcHandlers.get(message.method); if (!handler) throw new Error("method_not_found"); const result = await handler(message.params || {}); this.send({ type: "rpc.result", id: message.id, ok: true, result }); }
    catch (error) { this.send({ type: "rpc.result", id: message.id, ok: false, error: safeError(error) }); }
  }

  registerRpcHandlers() {
    this.rpcHandlers.set("system.ping", async () => ({ pong: true, at: new Date().toISOString() }));
    this.rpcHandlers.set("diagnostics.snapshot", async () => this.snapshot());
    this.rpcHandlers.set("plugins.list", async () => Object.values(this.app.plugins.plugins || {}).map(p => ({ id: p.id, name: p.manifest?.name, version: p.manifest?.version, enabled: !!this.app.plugins.enabledPlugins?.has(p.id) })));
    this.rpcHandlers.set("plugin.inspect", async ({ id }) => { const p = this.app.plugins.plugins?.[id]; if (!p) throw new Error("plugin_not_found"); return { id: p.id, manifest: { name: p.manifest?.name, version: p.manifest?.version, minAppVersion: p.manifest?.minAppVersion, isDesktopOnly: p.manifest?.isDesktopOnly } }; });
    this.rpcHandlers.set("logs.tail", async ({ limit = 100 }) => this.logs.slice(-Math.min(500, Math.max(1, Number(limit) || 100))));
    this.rpcHandlers.set("events.tail", async ({ limit = 100 }) => this.events.slice(-Math.min(500, Math.max(1, Number(limit) || 100))));
    this.rpcHandlers.set("vault.summary", async () => { const files = this.app.vault.getFiles(); const byExt = {}; files.forEach(f => byExt[f.extension] = (byExt[f.extension] || 0) + 1); return { fileCount: files.length, byExtension: byExt }; });
    this.rpcHandlers.set("network.probe", async ({ url, method = "HEAD" }) => {
      const parsed = new URL(url);
      if (parsed.username || parsed.password) throw new Error("probe_credentials_not_allowed");
      if (parsed.protocol !== "https:" || !this.settings.allowedProbeHosts.includes(parsed.hostname)) throw new Error("probe_host_not_allowed");
      method = String(method).toUpperCase();
      if (!["HEAD", "GET", "OPTIONS"].includes(method)) throw new Error("probe_method_not_allowed");
      const started = Date.now();
      const response = await requestUrl({ url: parsed.toString(), method, throw: false });
      const headers = {};
      ["content-type", "server", "date", "etag"].forEach(name => { if (response.headers?.[name]) headers[name] = response.headers[name]; });
      return { url: `${parsed.origin}${parsed.pathname}`, method, status: response.status, elapsedMs: Date.now() - started, headers };
    });
    this.rpcHandlers.set("commands.execute", async ({ id }) => { if (!this.settings.allowControlledActions) throw new Error("controlled_actions_disabled"); if (typeof id !== "string" || !/^[a-zA-Z0-9_.:-]+$/.test(id)) throw new Error("invalid_command_id"); if (!this.settings.allowedCommandIds.includes(id)) throw new Error("command_not_allowlisted"); const command = this.app.commands?.commands?.[id]; if (!command) throw new Error("command_not_found"); await this.app.commands.executeCommandById(id); return { executed: id }; });
    this.rpcHandlers.set("plugin.reload", async ({ id }) => { if (!this.settings.allowControlledActions) throw new Error("controlled_actions_disabled"); if (id === this.manifest.id) throw new Error("cannot_reload_transport_plugin"); if (!this.app.plugins.plugins?.[id]) throw new Error("plugin_not_found"); await this.app.plugins.disablePlugin(id); await this.app.plugins.enablePlugin(id); return { reloaded: id }; });
  }

  clientInfo() { return { plugin: "obsidian-live-debug", version: this.manifest.version, obsidian: this.app.appVersion || "unknown", platform: Platform.isMobile ? "mobile" : "desktop", deviceId: this.settings.deviceId }; }
  snapshot() { return { client: this.clientInfo(), foreground: this.foreground, connected: this.ws?.readyState === WebSocket.OPEN, controlledActions: !!this.settings.allowControlledActions, vault: { fileCount: this.app.vault.getFiles().length }, plugins: Object.keys(this.app.plugins.plugins || {}).length, liveSync: this.sanitizedPluginStatus("obsidian-livesync"), photoSmaller: this.sanitizedPluginStatus("photo-smaller") }; }
  sanitizedPluginStatus(id) { const p = this.app.plugins.plugins?.[id]; return p ? { installed: true, enabled: !!this.app.plugins.enabledPlugins?.has(id), version: p.manifest?.version } : { installed: false }; }
  async copySnapshot() { await navigator.clipboard?.writeText(JSON.stringify(this.snapshot(), null, 2)); new Notice("LiveDebug 诊断快照已复制"); }
}

class LiveDebugSettingTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); }
  display() {
    const { containerEl } = this; containerEl.empty(); containerEl.createEl("h2", { text: "Obsidian LiveDebug" });
    new Setting(containerEl).setName("中继 WebSocket 地址").setDesc("例如 wss://sync.example.com/obsidian-debug/ws/device").addText(t => t.setValue(this.plugin.settings.relayUrl).onChange(async v => { this.plugin.settings.relayUrl = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName("设备 ID").setDesc("用于在控制端区分设备；不要填写账号密码").addText(t => t.setValue(this.plugin.settings.deviceId).onChange(async v => { this.plugin.settings.deviceId = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName("设备令牌").setDesc("只保存在本机插件设置中，不会显示在日志或 API 响应").addText(t => { t.inputEl.type = "password"; t.setValue(this.plugin.settings.deviceToken).onChange(async v => { this.plugin.settings.deviceToken = v.trim(); await this.plugin.saveSettings(); }); });
    new Setting(containerEl).setName("自动连接").addToggle(t => t.setValue(this.plugin.settings.autoConnect).onChange(async v => { this.plugin.settings.autoConnect = v; await this.plugin.saveSettings(); if (v) this.plugin.connect(); else this.plugin.disconnect(); }));
    new Setting(containerEl).setName("允许受控操作").setDesc("关闭时只能读取诊断；开启后控制端才可重载插件或执行命令").addToggle(t => t.setValue(this.plugin.settings.allowControlledActions).onChange(async v => { this.plugin.settings.allowControlledActions = v; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName("捕获控制台日志").setDesc("关闭可减少敏感信息进入内存；日志仅保存在内存").addToggle(t => t.setValue(this.plugin.settings.captureConsole).onChange(async v => { this.plugin.settings.captureConsole = v; await this.plugin.saveSettings(); if (v && !this.plugin.restoreConsole) this.plugin.installConsoleCapture(); if (!v && this.plugin.restoreConsole) { this.plugin.restoreConsole(); this.plugin.restoreConsole = null; } }));
    new Setting(containerEl).setName("允许执行的命令 ID").setDesc("逗号分隔；即使已开启受控操作，不在此列表中的命令仍会被拒绝").addTextArea(t => t.setValue(this.plugin.settings.allowedCommandIds.join(", ")).onChange(async v => { this.plugin.settings.allowedCommandIds = v.split(",").map(x => x.trim()).filter(Boolean); await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName("允许探测的主机").setDesc("逗号分隔；网络探测只接受 HTTPS 且不返回响应正文").addTextArea(t => t.setValue(this.plugin.settings.allowedProbeHosts.join(", ")).onChange(async v => { this.plugin.settings.allowedProbeHosts = v.split(",").map(x => x.trim().toLowerCase()).filter(Boolean); await this.plugin.saveSettings(); }));
    const status = containerEl.createDiv({ cls: "obsidian-live-debug-status" }); status.createEl("p", { text: `状态：${this.plugin.ws?.readyState === WebSocket.OPEN ? "已连接" : "未连接"}` });
    new Setting(containerEl).addButton(b => b.setButtonText("立即连接").onClick(() => this.plugin.connect())).addButton(b => b.setButtonText("断开").onClick(() => this.plugin.disconnect())).addButton(b => b.setButtonText("复制诊断快照").onClick(() => this.plugin.copySnapshot()));
  }
}

module.exports = LiveDebugPlugin;
