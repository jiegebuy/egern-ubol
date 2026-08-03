const COLORS = {
  bg: '#160F20',
  bg2: '#28152F',
  card: '#FFFFFF0D',
  cardBorder: '#FFFFFF12',
  text: '#FFF9FF',
  muted: '#B9AEBE',
  faint: '#7F7285',
  green: '#4FD06B',
  orange: '#F6A53A',
  red: '#FF625F',
  purple: '#B77AF1',
};

const CODEX_USAGE_URL = 'https://chatgpt.com/backend-api/wham/usage';
const MANUAL_REFRESH_AFTER = '2099-12-31T23:59:59Z';
const CODEX_HEADERS = {
  Authorization: 'Bearer $TOKEN$',
  'Content-Type': 'application/json',
  'User-Agent': 'codex_cli_rs/0.76.0 (Egern Widget)',
};

function text(value, size = 'caption1', color = COLORS.text, weight = 'regular', extra = {}) {
  return {
    type: 'text',
    text: String(value),
    font: { size, weight },
    textColor: color,
    ...extra,
  };
}

function stack(direction, children, extra = {}) {
  return { type: 'stack', direction, children, ...extra };
}

function icon(name, color = COLORS.purple, size = 18) {
  return { type: 'image', src: `sf-symbol:${name}`, color, width: size, height: size };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function number(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().toLowerCase() === 'true';
}

function refreshMinutes(env) {
  const minutes = Math.trunc(number(env?.AUTO_REFRESH_MINUTES) || 0);
  return minutes > 0 ? clamp(minutes, 1, 525600) : 0;
}

function refreshAfter(env) {
  const minutes = refreshMinutes(env);
  return minutes > 0
    ? new Date(Date.now() + minutes * 60000).toISOString()
    : MANUAL_REFRESH_AFTER;
}

function refreshLabel(env) {
  const minutes = refreshMinutes(env);
  if (!minutes) return '仅手动刷新';
  if (minutes % 1440 === 0) return `每 ${minutes / 1440} 天自动刷新`;
  if (minutes % 60 === 0) return `每 ${minutes / 60} 小时自动刷新`;
  return `每 ${minutes} 分钟自动刷新`;
}

function apiBase(input) {
  let raw = String(input || 'http://localhost:8317').trim();
  raw = raw.replace(/\/management\.html(?:[?#].*)?$/i, '');
  raw = raw.replace(/\/?v0\/management\/?$/i, '');
  return raw.replace(/\/+$/, '') + '/v0/management';
}

function parseBody(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function readJson(response) {
  const payload = await response.json();
  if (response.status < 200 || response.status >= 300) {
    const message = payload?.error?.message || payload?.error || payload?.message;
    const error = new Error(message || `管理接口返回 HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function authHeaders(key) {
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function accountId(file) {
  return file?.id_token?.chatgpt_account_id || file?.id_token?.chatgptAccountId || '';
}

function identity(file, shouldMask) {
  const raw = String(file.email || file.label || file.name || 'Codex').replace(/\.json$/i, '');
  if (!shouldMask || !raw.includes('@')) return raw;
  const [local, domain] = raw.split('@');
  if (local.length <= 3) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function planName(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Codex';
  return raw
    .replace(/^chatgpt[_ -]*/i, '')
    .split(/[_ -]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function epochMs(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = number(value);
  if (numeric !== null) return numeric < 1e12 ? numeric * 1000 : numeric;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function windowInfo(window, fallbackId) {
  if (!window || typeof window !== 'object') return null;
  const usedRaw = number(window.used_percent ?? window.usedPercent);
  const seconds = number(window.limit_window_seconds ?? window.limitWindowSeconds);
  let resetAt = epochMs(window.reset_at ?? window.resetAt);
  const after = number(window.reset_after_seconds ?? window.resetAfterSeconds);
  if (resetAt === null && after !== null) resetAt = Date.now() + after * 1000;
  const used = usedRaw === null ? null : clamp(usedRaw, 0, 100);
  return {
    id: fallbackId,
    used,
    remaining: used === null ? null : clamp(100 - used, 0, 100),
    seconds,
    resetAt,
  };
}

function quotaWindows(payload) {
  const rate = payload?.rate_limit ?? payload?.rateLimit ?? {};
  const primary = windowInfo(rate.primary_window ?? rate.primaryWindow, 'primary');
  const secondary = windowInfo(rate.secondary_window ?? rate.secondaryWindow, 'secondary');
  const limitReached = rate.limit_reached === true || rate.limitReached === true || rate.allowed === false;
  const windows = [primary, secondary].filter(Boolean);
  if (limitReached) {
    for (const item of windows) {
      if (item.used === null) {
        item.used = 100;
        item.remaining = 0;
      }
    }
  }
  return windows;
}

function windowLabel(window) {
  const hours = window?.seconds ? Math.round(window.seconds / 3600) : null;
  if (hours === 5) return '5 小时额度';
  if (hours !== null && hours >= 24 * 28) return '月度额度';
  if (hours !== null && hours >= 24 * 6) return '周期额度';
  if (hours !== null) return `${hours} 小时额度`;
  return window?.id === 'secondary' ? '周期额度' : '可用额度';
}

function resetLabel(resetAt) {
  if (!resetAt) return '重置时间未知';
  const date = new Date(resetAt);
  const absolute = date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const delta = resetAt - Date.now();
  if (delta <= 0) return `${absolute} · 即将重置`;
  const hours = Math.ceil(delta / 3600000);
  const relative = hours < 24 ? `${hours} 小时后` : `${Math.ceil(hours / 24)} 天后`;
  return `${absolute} · ${relative}`;
}

function mainWindow(account) {
  return account.windows.find(item => item.id === 'secondary') || account.windows[0] || null;
}

function quotaColor(remaining) {
  if (remaining === null) return COLORS.faint;
  if (remaining >= 50) return COLORS.green;
  if (remaining >= 20) return COLORS.orange;
  return COLORS.red;
}

function percentLabel(value) {
  return value === null ? '--' : `${Math.round(value)}%`;
}

function svgData(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function progressImage(remaining, width, height = 6) {
  const value = remaining === null ? 0 : clamp(remaining, 0, 100);
  const color = quotaColor(remaining);
  const radius = height / 2;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'><rect width='${width}' height='${height}' rx='${radius}' fill='rgba(255,255,255,.10)'/><rect width='${width * value / 100}' height='${height}' rx='${radius}' fill='${color}'/></svg>`;
  return { type: 'image', src: svgData(svg), width, height };
}

function ringImage(remaining, size = 58) {
  const value = remaining === null ? 0 : clamp(remaining, 0, 100);
  const color = quotaColor(remaining);
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * value / 100;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='24' fill='none' stroke='rgba(255,255,255,.10)' stroke-width='7'/><circle cx='32' cy='32' r='24' fill='none' stroke='${color}' stroke-width='7' stroke-linecap='round' stroke-dasharray='${dash} ${circumference - dash}' transform='rotate(-90 32 32)'/><text x='32' y='36' text-anchor='middle' fill='white' font-family='-apple-system' font-size='13' font-weight='700'>${percentLabel(remaining)}</text></svg>`;
  return { type: 'image', src: svgData(svg), width: size, height: size };
}

async function loadAccounts(ctx, env) {
  const base = apiBase(env.API_URL);
  const key = String(env.MANAGEMENT_KEY || '').trim();
  if (!key) {
    const error = new Error('请在模块 Env 中填写 MANAGEMENT_KEY');
    error.kind = 'config';
    throw error;
  }

  const listResponse = await ctx.http.get(`${base}/auth-files`, {
    headers: authHeaders(key),
    timeout: 10000,
  });
  const list = await readJson(listResponse);
  const filter = String(env.ACCOUNT_FILTER || '').trim().toLowerCase();
  const max = clamp(Math.trunc(number(env.MAX_ACCOUNTS) || 3), 1, 4);
  const candidates = (Array.isArray(list?.files) ? list.files : [])
    .filter(file => String(file.type || file.provider || '').toLowerCase() === 'codex')
    .filter(file => file.disabled !== true)
    .filter(file => !filter || `${file.name || ''} ${file.email || ''}`.toLowerCase().includes(filter))
    .slice(0, max);

  if (!candidates.length) {
    const error = new Error(filter ? '没有符合筛选条件的 Codex 凭证' : 'CLIProxyAPI 中没有可用的 Codex 凭证');
    error.kind = 'empty';
    throw error;
  }

  const results = await Promise.all(candidates.map(async file => {
    try {
      const headers = { ...CODEX_HEADERS };
      const id = accountId(file);
      if (id) headers['Chatgpt-Account-Id'] = id;
      const response = await ctx.http.post(`${base}/api-call`, {
        headers: authHeaders(key),
        body: {
          auth_index: String(file.auth_index ?? file.authIndex ?? ''),
          method: 'GET',
          url: CODEX_USAGE_URL,
          header: headers,
        },
        timeout: 15000,
      });
      const envelope = await readJson(response);
      const status = number(envelope?.status_code) || 0;
      const payload = parseBody(envelope?.body);
      if (status < 200 || status >= 300) {
        const message = payload?.error?.message || payload?.error || payload?.message;
        throw new Error(message || `上游返回 HTTP ${status}`);
      }
      if (!payload) throw new Error('上游返回了无法解析的数据');
      return {
        file,
        plan: planName(payload.plan_type ?? payload.planType ?? file?.id_token?.plan_type),
        windows: quotaWindows(payload),
        error: null,
      };
    } catch (error) {
      return { file, plan: planName(file?.id_token?.plan_type), windows: [], error: error.message };
    }
  }));

  return results;
}

function headerRow(count, compact = false) {
  return stack('row', [
    icon('cube.transparent.fill', COLORS.purple, compact ? 16 : 20),
    text('CLI Proxy API', compact ? 'caption1' : 'headline', COLORS.text, 'bold', { maxLines: 1 }),
    { type: 'spacer' },
    text(`${count} 个凭证`, 'caption2', COLORS.muted, 'medium'),
  ], { alignItems: 'center', gap: 7 });
}

function compactAccount(account, env, width = 220) {
  const current = mainWindow(account);
  const remaining = current?.remaining ?? null;
  return stack('column', [
    stack('row', [
      icon(account.error ? 'exclamationmark.triangle.fill' : 'shippingbox.fill', account.error ? COLORS.orange : COLORS.purple, 15),
      text(identity(account.file, bool(env.MASK_EMAIL, true)), 'caption1', COLORS.text, 'semibold', { maxLines: 1, minScale: 0.65, flex: 1 }),
      text(account.error ? '失败' : percentLabel(remaining), 'caption1', account.error ? COLORS.orange : quotaColor(remaining), 'bold'),
    ], { alignItems: 'center', gap: 6 }),
    account.error
      ? text(account.error, 'caption2', COLORS.muted, 'regular', { maxLines: 1, minScale: 0.65 })
      : stack('row', [
          text(`${account.plan} · ${windowLabel(current)}`, 'caption2', COLORS.muted, 'regular', { maxLines: 1, flex: 1 }),
          text(resetLabel(current?.resetAt), 'caption2', COLORS.faint, 'regular', { maxLines: 1, minScale: 0.6 }),
        ], { alignItems: 'center', gap: 4 }),
    account.error ? { type: 'spacer', length: 1 } : progressImage(remaining, width, 5),
  ], {
    gap: 5,
    padding: [9, 10],
    backgroundColor: COLORS.card,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  });
}

function largeAccount(account, env, width = 290) {
  const current = mainWindow(account);
  const remaining = current?.remaining ?? null;
  const rows = account.windows.slice(0, 2).map(item =>
    stack('column', [
      stack('row', [
        text(windowLabel(item), 'caption1', COLORS.text, 'medium'),
        { type: 'spacer' },
        text(percentLabel(item.remaining), 'caption1', quotaColor(item.remaining), 'bold'),
        text(resetLabel(item.resetAt), 'caption2', COLORS.faint, 'regular', { maxLines: 1, minScale: 0.55 }),
      ], { alignItems: 'center', gap: 5 }),
      progressImage(item.remaining, width, 6),
    ], { gap: 4 })
  );
  return stack('column', [
    stack('row', [
      icon(account.error ? 'exclamationmark.triangle.fill' : 'cube.fill', account.error ? COLORS.orange : COLORS.purple, 20),
      stack('column', [
        text(identity(account.file, bool(env.MASK_EMAIL, true)), 'subheadline', COLORS.text, 'bold', { maxLines: 1, minScale: 0.65 }),
        text(account.error ? account.error : `套餐 ${account.plan}`, 'caption2', account.error ? COLORS.orange : COLORS.muted, 'regular', { maxLines: 1, minScale: 0.6 }),
      ], { gap: 2, flex: 1 }),
      ringImage(remaining, 52),
    ], { alignItems: 'center', gap: 8 }),
    ...rows,
  ], {
    gap: 7,
    padding: 11,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  });
}

function background(children, padding = 14, gap = 8, env = {}) {
  return {
    type: 'widget',
    refreshAfter: refreshAfter(env),
    backgroundGradient: {
      type: 'linear',
      colors: [COLORS.bg2, COLORS.bg, '#0F0A16'],
      stops: [0, 0.58, 1],
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 1, y: 1 },
    },
    padding,
    gap,
    children,
  };
}

function errorWidget(message, family, kind, env) {
  const compact = family?.startsWith('accessory');
  const title = kind === 'config' ? '需要配置' : kind === 'empty' ? '暂无凭证' : '连接失败';
  if (family === 'accessoryInline') return background([text(`CLI Proxy API · ${title}`, 'caption1', COLORS.text, 'semibold')], 0, 0, env);
  return background([
    stack('row', [icon(kind === 'config' ? 'key.fill' : 'exclamationmark.triangle.fill', COLORS.orange, compact ? 14 : 20), text(title, compact ? 'caption1' : 'headline', COLORS.text, 'bold')], { alignItems: 'center', gap: 7 }),
    text(message, compact ? 'caption2' : 'caption1', COLORS.muted, 'regular', { maxLines: compact ? 2 : 3, minScale: 0.65 }),
  ], compact ? 6 : 14, 6, env);
}

function render(accounts, family, env) {
  const successful = accounts.filter(account => !account.error);
  const values = successful.map(mainWindow).filter(Boolean).map(item => item.remaining).filter(value => value !== null);
  const lowest = values.length ? Math.min(...values) : null;

  if (family === 'accessoryInline') {
    return background([text(`Codex ${accounts.length} 个凭证 · 最低 ${percentLabel(lowest)}`, 'caption1', COLORS.text, 'semibold')], 0, 0, env);
  }

  if (family === 'accessoryCircular') {
    return background([ringImage(lowest, 54)], 2, 0, env);
  }

  if (family === 'accessoryRectangular') {
    const first = accounts[0];
    const current = mainWindow(first);
    return background([
      headerRow(accounts.length, true),
      stack('row', [
        text(identity(first.file, bool(env.MASK_EMAIL, true)), 'caption2', COLORS.muted, 'medium', { maxLines: 1, flex: 1, minScale: 0.6 }),
        text(first.error ? '失败' : percentLabel(current?.remaining ?? null), 'caption1', first.error ? COLORS.orange : quotaColor(current?.remaining ?? null), 'bold'),
      ], { alignItems: 'center', gap: 5 }),
    ], 7, 4, env);
  }

  if (family === 'systemSmall') {
    const first = accounts[0];
    const current = mainWindow(first);
    return background([
      headerRow(accounts.length, true),
      { type: 'spacer' },
      ringImage(current?.remaining ?? null, 66),
      { type: 'spacer' },
      text(identity(first.file, bool(env.MASK_EMAIL, true)), 'caption1', COLORS.text, 'semibold', { maxLines: 1, minScale: 0.6 }),
      text(first.error ? first.error : `${windowLabel(current)} · ${resetLabel(current?.resetAt)}`, 'caption2', first.error ? COLORS.orange : COLORS.muted, 'regular', { maxLines: 1, minScale: 0.55 }),
    ], 12, 4, env);
  }

  if (family === 'systemMedium') {
    return background([
      headerRow(accounts.length),
      ...accounts.slice(0, 2).map(account => compactAccount(account, env, 275)),
    ], 10, 5, env);
  }

  if (family === 'systemExtraLarge') {
    const cards = accounts.slice(0, 4).map(account => ({
      ...largeAccount(account, env, 300),
      flex: 1,
    }));
    const rows = [];
    for (let index = 0; index < cards.length; index += 2) {
      rows.push(stack('row', cards.slice(index, index + 2), { gap: 8 }));
    }
    return background([
      headerRow(accounts.length),
      text(`Codex · 最低剩余 ${percentLabel(lowest)}`, 'caption2', quotaColor(lowest), 'medium'),
      ...rows,
      stack('row', [icon(refreshMinutes(env) ? 'arrow.clockwise' : 'hand.tap.fill', COLORS.muted, 11), text(refreshLabel(env), 'caption2', COLORS.faint)], { alignItems: 'center', gap: 4 }),
    ], 13, 8, env);
  }

  return background([
    headerRow(accounts.length),
    text(`Codex · 最低剩余 ${percentLabel(lowest)}`, 'caption2', quotaColor(lowest), 'medium'),
    ...accounts.slice(0, 2).map(account => largeAccount(account, env, 290)),
    stack('row', [icon(refreshMinutes(env) ? 'arrow.clockwise' : 'hand.tap.fill', COLORS.muted, 11), text(refreshLabel(env), 'caption2', COLORS.faint)], { alignItems: 'center', gap: 4 }),
  ], 13, 8, env);
}

export default async function (ctx) {
  const env = ctx.env || {};
  const family = ctx.widgetFamily || 'systemMedium';
  try {
    const accounts = await loadAccounts(ctx, env);
    return render(accounts, family, env);
  } catch (error) {
    let message = error?.message || '未知错误';
    if (error?.status === 401) message = 'MANAGEMENT_KEY 无效或已过期';
    if (error?.status === 404) message = '未找到管理接口，请检查地址及远程管理设置';
    return errorWidget(message, family, error?.kind, env);
  }
}
