import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, sendMessage, sendHumanMessage, suggestTask, createTask, toggleTask, toggleTakeover, resetState } from '../src/domain.js';

test('a customer message adds a transcript entry and a simulated reply', () => {
  const before = initialState();
  const customerId = before.customers[0].id;
  const after = sendMessage(before, customerId, '想了解一下服务方案');
  assert.equal(after.conversations[customerId].length, before.conversations[customerId].length + 2);
  assert.equal(after.conversations[customerId].at(-2).text, '想了解一下服务方案');
  assert.equal(after.conversations[customerId].at(-1).author, 'demo');
  assert.equal(before.conversations[customerId].length, 2);
});

test('blank messages do not change state', () => {
  const before = initialState();
  assert.equal(sendMessage(before, before.customers[0].id, '  '), before);
});

test('tasks can be created and completed for a customer', () => {
  const before = initialState();
  const customerId = before.customers[0].id;
  const added = createTask(before, customerId, '发送方案摘要');
  assert.equal(added.tasks.length, before.tasks.length + 1);
  assert.equal(added.tasks.at(-1).customerId, customerId);
  const completed = toggleTask(added, added.tasks.at(-1).id);
  assert.equal(completed.tasks.at(-1).done, true);
  assert.equal(added.tasks.at(-1).done, false);
  assert.equal(completed.timeline[customerId][0].title, '完成跟进任务');
  assert.equal(completed.timeline[customerId][0].detail, '发送方案摘要');
  assert.match(completed.timeline[customerId][0].at, /^\d{4}-\d\d-\d\dT/);
});

test('reopening a task records the change in the customer journey', () => {
  const done = toggleTask(initialState(), 'T-1');
  const reopened = toggleTask(done, 'T-1');
  assert.equal(reopened.timeline['C-101'][0].title, '重新打开跟进任务');
  assert.equal(reopened.tasks[0].done, false);
});

test('human takeover suppresses simulated replies', () => {
  const before = initialState();
  const customerId = before.customers[0].id;
  const taken = toggleTakeover(before, customerId);
  const after = sendMessage(taken, customerId, '请帮我人工处理');
  assert.equal(taken.takeovers[customerId], true);
  assert.equal(after.conversations[customerId].length, taken.conversations[customerId].length + 1);
  assert.equal(after.conversations[customerId].at(-1).author, 'customer');
});

test('human replies require takeover and are recorded distinctly', () => {
  const before = initialState();
  assert.equal(sendHumanMessage(before, 'C-101', '您好'), before);
  const taken = toggleTakeover(before, 'C-101');
  assert.equal(sendHumanMessage(taken, 'C-101', '  '), taken);
  const after = sendHumanMessage(taken, 'C-101', '您好，我来跟进');
  assert.equal(after.conversations['C-101'].at(-1).author, 'human');
  assert.equal(after.conversations['C-101'].at(-1).text, '您好，我来跟进');
  assert.equal(after.timeline['C-101'][0].title, '顾问回复');
});

test('task draft uses the latest customer message', () => {
  const state = sendMessage(initialState(), 'C-101', '下周想看产品演示');
  assert.match(suggestTask(state, 'C-101'), /下周想看产品演示/);
  assert.equal(state.tasks.length, 3);
});

test('reset returns fresh fictional data', () => {
  const initial = initialState();
  const changed = sendMessage(initial, initial.customers[0].id, '测试');
  assert.deepEqual(resetState(), initial);
  assert.notDeepEqual(changed, initial);
});
