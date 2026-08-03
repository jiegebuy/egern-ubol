import assert from 'node:assert/strict';
import test from 'node:test';

import widget from '../scripts/quota-widget.js';

function response(status, body) {
  return {
    status,
    async json() {
      return body;
    },
  };
}

function mockContext(family = 'systemMedium') {
  const calls = [];
  return {
    calls,
    ctx: {
      widgetFamily: family,
      env: {
        API_URL: 'http://localhost:8317/management.html#/quota',
        MANAGEMENT_KEY: 'test-management-key',
        MAX_ACCOUNTS: '3',
        MASK_EMAIL: 'true',
        AUTO_REFRESH_MINUTES: '0',
      },
      http: {
        async get(url, options) {
          calls.push({ method: 'GET', url, options });
          return response(200, {
            files: [
              {
                name: 'codex-first.json',
                type: 'codex',
                email: 'first.account@example.com',
                auth_index: 'auth-1',
                id_token: { chatgpt_account_id: 'account-1', plan_type: 'plus' },
              },
              {
                name: 'codex-second.json',
                provider: 'codex',
                email: 'second@example.com',
                auth_index: 'auth-2',
              },
              { name: 'claude.json', type: 'claude', auth_index: 'auth-3' },
            ],
          });
        },
        async post(url, options) {
          calls.push({ method: 'POST', url, options });
          const index = options.body.auth_index;
          return response(200, {
            status_code: 200,
            body: JSON.stringify({
              plan_type: index === 'auth-1' ? 'plus' : 'team',
              rate_limit: {
                primary_window: {
                  used_percent: index === 'auth-1' ? 20 : 60,
                  limit_window_seconds: 18000,
                  reset_after_seconds: 3600,
                },
                secondary_window: {
                  used_percent: index === 'auth-1' ? 10 : 35,
                  limit_window_seconds: 604800,
                  reset_after_seconds: 172800,
                },
              },
            }),
          });
        },
      },
    },
  };
}

function collect(node, predicate, found = []) {
  if (!node || typeof node !== 'object') return found;
  if (predicate(node)) found.push(node);
  for (const child of node.children || []) collect(child, predicate, found);
  return found;
}

test('loads Codex quota through the management proxy and renders two accounts', async () => {
  const { ctx, calls } = mockContext();
  const result = await widget(ctx);

  assert.equal(result.type, 'widget');
  assert.equal(result.refreshAfter, '2099-12-31T23:59:59Z');
  assert.equal(calls[0].url, 'http://localhost:8317/v0/management/auth-files');
  assert.equal(calls.filter(call => call.method === 'POST').length, 2);
  assert.equal(calls[1].options.body.url, 'https://chatgpt.com/backend-api/wham/usage');
  assert.equal(calls[1].options.body.header['Chatgpt-Account-Id'], 'account-1');

  const labels = collect(result, node => node.type === 'text').map(node => node.text);
  assert.ok(labels.includes('2 个凭证'));
  assert.ok(labels.some(label => label.includes('fi***t@example.com')));
  assert.ok(labels.includes('90%'));
  assert.ok(labels.includes('65%'));
});

test('renders a useful setup state when the management key is absent', async () => {
  const { ctx } = mockContext('systemSmall');
  ctx.env.MANAGEMENT_KEY = '';
  const result = await widget(ctx);
  const labels = collect(result, node => node.type === 'text').map(node => node.text);
  assert.ok(labels.includes('需要配置'));
  assert.ok(labels.some(label => label.includes('MANAGEMENT_KEY')));
  assert.equal(result.refreshAfter, '2099-12-31T23:59:59Z');
});

test('adapts to lock-screen inline widgets', async () => {
  const { ctx } = mockContext('accessoryInline');
  const result = await widget(ctx);
  const labels = collect(result, node => node.type === 'text').map(node => node.text);
  assert.deepEqual(labels, ['Codex 2 个凭证 · 最低 65%']);
  assert.equal(result.refreshAfter, '2099-12-31T23:59:59Z');
});

test('uses a bounded two-card layout for a large widget', async () => {
  const { ctx } = mockContext('systemLarge');
  const result = await widget(ctx);
  const cards = collect(
    result,
    node => node.type === 'stack' && node.borderRadius === 14 && node.backgroundColor === '#FFFFFF0D',
  );
  assert.equal(cards.length, 2);
});

test('schedules the next update from the configured refresh interval', async () => {
  const { ctx } = mockContext('systemLarge');
  ctx.env.AUTO_REFRESH_MINUTES = '30';
  const before = Date.now();
  const result = await widget(ctx);
  const scheduled = Date.parse(result.refreshAfter);

  assert.ok(scheduled >= before + 30 * 60000);
  assert.ok(scheduled <= Date.now() + 30 * 60000);
  const labels = collect(result, node => node.type === 'text').map(node => node.text);
  assert.ok(labels.includes('每 30 分钟自动刷新'));
});
