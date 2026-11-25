import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, sendMessage, createTask, toggleTask, toggleTakeover } from '../src/domain.js';
import { renderApp } from '../src/app.js';

test('overview shows customer and pending task counts with demo disclosure', () => {
  const html = renderApp(initialState(), { view: 'overview', customerId: 'C-101' });
  assert.match(html, /客户总数/);
  assert.match(html, /待办任务/);
  assert.match(html, /离线模拟/);
  assert.match(html, /星河设计工作室/);
});

test('selected customer view shows its timeline and tasks', () => {
  const state = createTask(initialState(), 'C-102', '发送案例');
  const html = renderApp(state, { view: 'customers', customerId: 'C-102' });
  assert.match(html, /周以安/);
  assert.match(html, /首次咨询/);
  assert.match(html, /发送案例/);
  assert.doesNotMatch(html, /进入方案评估/);
});

test('consultation reflects a message and takeover state', () => {
  let state = sendMessage(initialState(), 'C-101', '想约演示');
  state = toggleTakeover(state, 'C-101');
  const html = renderApp(state, { view: 'consultation', customerId: 'C-101' });
  assert.match(html, /想约演示/);
  assert.match(html, /人工接管中/);
  assert.match(html, /自动演示回复已暂停/);
});

test('task panel reflects completion', () => {
  const state = toggleTask(initialState(), 'T-1');
  const html = renderApp(state, { view: 'tasks', customerId: 'C-101' });
  assert.match(html, /已完成/);
  assert.match(html, /发送方案摘要/);
  assert.match(html, /aria-label="标记为待办：发送方案摘要"/);
  assert.match(html, /aria-label="完成任务：确认使用场景"/);
});

test('customer input is escaped in rendered HTML', () => {
  const state = sendMessage(initialState(), 'C-101', '<img src=x onerror=alert(1)>');
  const html = renderApp(state, { view: 'consultation', customerId: 'C-101' });
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x/);
});

test('collapsed navigation has readable labels and reset remains in the footer', () => {
  const html = renderApp(initialState(), { view: 'overview', customerId: 'C-101' });
  assert.match(html, /aria-label="客户 360"/);
  assert.match(html, /<footer[^>]*>[\s\S]*data-action="reset"/);
});
