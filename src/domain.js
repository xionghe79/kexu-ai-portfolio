import { demoData } from './demo-data.js';

export const initialState = () => structuredClone(demoData);
export const resetState = initialState;

const now = () => new Date().toISOString();
const nextId = (state, prefix) => `${prefix}-${state.nextId++}`;

function simulatedReply(text) {
  if (/价格|费用|预算/.test(text)) return '演示回复：可以先记录预算范围，再由顾问提供正式报价。您希望按团队规模还是使用场景了解方案？';
  if (/人工|顾问|联系/.test(text)) return '演示回复：我已记录您的人工协助需求，顾问可以在工作台接管这段会话。';
  if (/演示|预约|时间/.test(text)) return '演示回复：可以先整理参与人员和关注点，再由顾问确认演示时间。';
  return '演示回复：已记录您的问题。可以补充一下当前使用场景，我会将重点整理为后续跟进线索。';
}

export function sendMessage(state, customerId, text) {
  const value = String(text ?? '').trim();
  if (!value || !state.conversations[customerId]) return state;
  const next = structuredClone(state);
  const at = now();
  next.conversations[customerId].push({ id: nextId(next, 'M'), author: 'customer', text: value, at });
  if (!next.takeovers[customerId]) {
    next.conversations[customerId].push({ id: nextId(next, 'M'), author: 'demo', text: simulatedReply(value), at });
  }
  next.timeline[customerId].unshift({ id: nextId(next, 'E'), title: '客户咨询', detail: value, at });
  return next;
}

export function createTask(state, customerId, title) {
  const value = String(title ?? '').trim();
  if (!value || !state.customers.some(customer => customer.id === customerId)) return state;
  const next = structuredClone(state);
  next.tasks.push({ id: nextId(next, 'T'), customerId, title: value, done: false, due: '待安排' });
  next.timeline[customerId].unshift({ id: nextId(next, 'E'), title: '新建跟进任务', detail: value, at: now() });
  return next;
}

export function toggleTask(state, taskId) {
  if (!state.tasks.some(task => task.id === taskId)) return state;
  const next = structuredClone(state);
  const task = next.tasks.find(item => item.id === taskId);
  task.done = !task.done;
  next.timeline[task.customerId].unshift({ id: nextId(next, 'E'), title: task.done ? '完成跟进任务' : '重新打开跟进任务', detail: task.title, at: now() });
  return next;
}

export function toggleTakeover(state, customerId) {
  if (!(customerId in state.takeovers)) return state;
  const next = structuredClone(state);
  next.takeovers[customerId] = !next.takeovers[customerId];
  next.timeline[customerId].unshift({ id: nextId(next, 'E'), title: next.takeovers[customerId] ? '人工接管' : '恢复演示回复', detail: next.takeovers[customerId] ? '自动演示回复已暂停' : '自动演示回复已恢复', at: now() });
  return next;
}
