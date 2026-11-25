import { initialState, sendMessage, createTask, toggleTask, toggleTakeover, resetState } from './domain.js';

const views = [
  ['overview', '总览', '◫'],
  ['customers', '客户 360', '◎'],
  ['consultation', '咨询工作台', '▤'],
  ['tasks', '跟进任务', '✓']
];

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const customerById = (state, id) => state.customers.find(customer => customer.id === id) || state.customers[0];
const customerName = (state, id) => customerById(state, id)?.name || '未知客户';
const initials = name => [...name].slice(-2).join('');
const dateKey = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const clockTime = date => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
const formatWhen = (at, today) => {
  const date = new Date(at);
  const key = dateKey(date);
  const label = key === dateKey(today) ? '今天' : key === dateKey(new Date(today.getTime() - 86400000)) ? '昨天' : key.replaceAll('-', '/');
  return `${label} ${clockTime(date)}`;
};

function customerRows(state, selectedId, view) {
  return state.customers.map(customer => `
    <button class="customer-row ${customer.id === selectedId ? 'selected' : ''}" data-customer="${escapeHtml(customer.id)}" data-view="${view}">
      <span class="avatar" style="--avatar:${escapeHtml(customer.color)}">${escapeHtml(initials(customer.name))}</span>
      <span class="customer-row-main"><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.company)}</small></span>
      <span class="row-stage">${escapeHtml(customer.stage)}</span>
      <span class="row-arrow">↗</span>
    </button>`).join('');
}

function timeline(state, customerId, today) {
  return [...(state.timeline[customerId] || [])].sort((a, b) => new Date(b.at) - new Date(a.at)).map(item => `
    <li class="timeline-item"><span class="timeline-dot"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p><small>${escapeHtml(formatWhen(item.at, today))}</small></div></li>`).join('');
}

function taskRows(state, customerId = null) {
  const tasks = customerId ? state.tasks.filter(task => task.customerId === customerId) : state.tasks;
  return tasks.map(task => `
    <li class="task-row ${task.done ? 'done' : ''}">
      <button class="task-check" data-task="${escapeHtml(task.id)}" aria-label="${task.done ? '标记为待办' : '完成任务'}：${escapeHtml(task.title)}">${task.done ? '✓' : ''}</button>
      <div><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(customerName(state, task.customerId))} · ${escapeHtml(task.due)}</small></div>
      <span class="task-status">${task.done ? '已完成' : '待跟进'}</span>
    </li>`).join('') || '<li class="empty">暂无跟进任务</li>';
}

function overview(state, selectedId) {
  const pending = state.tasks.filter(task => !task.done).length;
  const active = Object.values(state.takeovers).filter(Boolean).length;
  const avgScore = Math.round(state.customers.reduce((sum, customer) => sum + customer.score, 0) / state.customers.length);
  return `
    <section class="hero"><div><span class="eyebrow light">CLIENT JOURNEY STUDIO</span><h2>把每一次对话，<br>接成下一步行动。</h2><p>从客户信号到跟进任务，在同一工作台看清旅程、责任人与交接状态。</p><button class="hero-link" data-nav="consultation">进入咨询工作台 <span>↗</span></button></div><div class="hero-art" aria-hidden="true"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><span class="orbit-center">客序<br><small>AI</small></span><span class="orbit-dot dot-one"></span><span class="orbit-dot dot-two"></span><span class="orbit-dot dot-three"></span></div></section>
    <section class="metric-grid" aria-label="演示指标">
      <article class="metric-card"><span>客户总数</span><strong>${state.customers.length}<small> 位</small></strong><p>合成演示档案</p></article>
      <article class="metric-card"><span>待办任务</span><strong>${pending}<small> 项</small></strong><p>需要跟进的下一步</p></article>
      <article class="metric-card"><span>人工接管</span><strong>${active}<small> 条</small></strong><p>自动回复已暂停</p></article>
      <article class="metric-card"><span>平均意向分</span><strong>${avgScore}<small> / 100</small></strong><p>仅用于界面演示</p></article>
    </section>
    <section class="content-grid"><article class="panel"><div class="panel-head"><div><span class="eyebrow">CUSTOMER SIGNALS</span><h3>近期客户</h3></div><button class="text-link" data-nav="customers">查看全部 ↗</button></div><div class="customer-list">${customerRows(state, selectedId, 'customers')}</div></article><article class="panel"><div class="panel-head"><div><span class="eyebrow">NEXT ACTIONS</span><h3>跟进清单</h3></div><button class="text-link" data-nav="tasks">任务视图 ↗</button></div><ul class="task-list">${taskRows(state)}</ul></article></section>`;
}

function customers(state, customer, today) {
  const ownTasks = state.tasks.filter(task => task.customerId === customer.id && !task.done).length;
  const nextAction = state.tasks.find(task => task.customerId === customer.id && !task.done)?.title || '暂无待办任务';
  return `<section class="workspace-grid"><article class="panel list-panel"><div class="panel-head"><div><span class="eyebrow">CUSTOMER DIRECTORY</span><h3>客户档案</h3></div><span class="count-pill">${state.customers.length} 位</span></div><div class="customer-list">${customerRows(state, customer.id, 'customers')}</div></article>
    <div class="detail-stack"><article class="panel profile-panel"><div class="profile-top"><span class="avatar large" style="--avatar:${escapeHtml(customer.color)}">${escapeHtml(initials(customer.name))}</span><div><span class="eyebrow">CUSTOMER 360</span><h2>${escapeHtml(customer.name)}</h2><p>${escapeHtml(customer.company)}</p></div><span class="stage-badge">${escapeHtml(customer.stage)}</span></div><div class="profile-facts"><div><span>兴趣方向</span><strong>${escapeHtml(customer.interest)}</strong></div><div><span>负责人</span><strong>${escapeHtml(customer.owner)}</strong></div><div><span>意向分</span><strong>${customer.score} / 100</strong></div><div><span>待办任务</span><strong>${ownTasks} 项</strong></div></div><div class="next-action"><span>建议下一步</span><strong>${escapeHtml(nextAction)}</strong><button data-nav="consultation">查看对话 ↗</button></div></article>
    <article class="panel"><div class="panel-head"><div><span class="eyebrow">ACTIVITY</span><h3>旅程时间线</h3></div></div><ul class="timeline">${timeline(state, customer.id, today)}</ul></article></div></section>`;
}

function consultation(state, customer, today) {
  const takeover = state.takeovers[customer.id];
  const messages = state.conversations[customer.id] || [];
  return `<section class="workspace-grid"><article class="panel list-panel"><div class="panel-head"><div><span class="eyebrow">CONVERSATIONS</span><h3>咨询队列</h3></div><span class="count-pill">${state.customers.length} 条</span></div><div class="customer-list">${customerRows(state, customer.id, 'consultation')}</div><div class="side-note"><span class="note-icon">✳</span><p>演示回复由本地规则生成，不连接模型或真实客服系统。</p></div></article>
    <article class="panel chat-panel"><div class="chat-head"><div class="chat-person"><span class="avatar" style="--avatar:${escapeHtml(customer.color)}">${escapeHtml(initials(customer.name))}</span><div><h3>${escapeHtml(customer.name)}</h3><small>${escapeHtml(customer.company)} · ${escapeHtml(customer.stage)}</small></div></div><span class="chat-state ${takeover ? 'human' : ''}">${takeover ? '人工接管中' : '离线模拟回复'}</span></div><div class="chat-disclosure">${takeover ? '自动演示回复已暂停。新消息只记录在本地会话中。' : '当前为离线模拟。回复由固定规则生成，不代表真实 AI 服务。'}</div><div class="messages" id="messages">${messages.map(message => `<div class="message ${message.author}"><span class="message-author">${message.author === 'customer' ? escapeHtml(customer.name) : '演示助手'}</span><p>${escapeHtml(message.text)}</p><small>${escapeHtml(formatWhen(message.at, today))}</small></div>`).join('')}</div><form id="message-form" class="composer"><label class="sr-only" for="message-input">输入演示消息</label><input id="message-input" name="message" placeholder="输入一句话，体验咨询到跟进的流程…" autocomplete="off" maxlength="500" /><button type="submit">发送 ↗</button></form><div class="chat-actions"><button data-action="takeover" class="${takeover ? 'active' : ''}">${takeover ? '恢复演示回复' : '人工接管'}</button><button data-action="quick-task">生成跟进任务</button><span>所有内容仅保存在此浏览器</span></div></article></section>`;
}

function tasksView(state, customer) {
  const pending = state.tasks.filter(task => !task.done).length;
  return `<section class="content-grid tasks-grid"><article class="panel"><div class="panel-head"><div><span class="eyebrow">FOLLOW-UP QUEUE</span><h3>跟进任务</h3></div><span class="count-pill">${pending} 项待办</span></div><ul class="task-list full">${taskRows(state)}</ul></article><article class="panel create-panel"><span class="eyebrow">CREATE ACTION</span><h3>把线索变成行动</h3><p>任务会同时出现在客户档案与时间线中，便于面试演示完整闭环。</p><form id="task-form"><label for="task-customer">关联客户</label><select id="task-customer" name="customerId">${state.customers.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === customer.id ? 'selected' : ''}>${escapeHtml(item.name)} · ${escapeHtml(item.company)}</option>`).join('')}</select><label for="task-title">任务内容</label><input id="task-title" name="title" placeholder="例如：发送产品介绍" maxlength="100" required /><button type="submit">创建任务 ↗</button></form></article></section>`;
}

export function renderApp(state, selection = {}, today = new Date()) {
  const view = views.some(item => item[0] === selection.view) ? selection.view : 'overview';
  const customer = customerById(state, selection.customerId);
  const title = { overview: '工作台总览', customers: '客户 360', consultation: '咨询工作台', tasks: '跟进任务' }[view];
  return `<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-symbol">序<span>✳</span></span><div><strong>客序 AI</strong><small>CLIENT JOURNEY STUDIO</small></div></div><div class="nav-heading">WORKSPACE</div><nav aria-label="主导航">${views.map(([key, label, icon]) => `<button class="nav-item ${key === view ? 'current' : ''}" data-nav="${key}" aria-label="${label}"><span class="nav-icon">${icon}</span><span>${label}</span>${key === 'tasks' ? `<em>${state.tasks.filter(task => !task.done).length}</em>` : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="demo-card"><span class="demo-spark">✳</span><strong>作品集演示</strong><p>虚构资料 · 离线模拟<br>无真实客户和模型调用</p></div><button class="reset-link" data-action="reset">重置演示数据 ↺</button></div></aside><main class="main"><header class="topbar"><div><span class="breadcrumb">工作空间 <span>/</span> ${title}</span><h1>${title}</h1></div><div class="header-right"><span class="live-dot"></span><span>本地演示模式</span><span class="header-avatar">访</span></div></header><div class="page-content">${view === 'overview' ? overview(state, customer.id) : view === 'customers' ? customers(state, customer, today) : view === 'consultation' ? consultation(state, customer, today) : tasksView(state, customer)}</div><footer class="footer">客序 AI · Client Journey Studio <button data-action="reset">重置演示数据 ↺</button><span>所有品牌、人物和业务数据均为虚构演示</span></footer></main></div>`;
}

const storageKey = 'kexu-ai-portfolio-demo-v2';
const root = typeof document === 'undefined' ? null : document.getElementById('app');
if (root) {
  let state = initialState();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.customers?.length === 3 && saved?.conversations && Array.isArray(saved.tasks)) state = saved;
  } catch { /* A damaged local demo snapshot starts fresh. */ }
  let selection = { view: 'overview', customerId: state.customers[0].id };
  const paint = () => {
    root.innerHTML = renderApp(state, selection);
    if (selection.view === 'consultation') root.querySelector('#messages')?.scrollTo(0, 99999);
  };
  const update = next => { state = next; localStorage.setItem(storageKey, JSON.stringify(state)); paint(); };
  paint();

  root.addEventListener('click', event => {
    const nav = event.target.closest('[data-nav]');
    if (nav) { selection.view = nav.dataset.nav; paint(); return; }
    const customer = event.target.closest('[data-customer]');
    if (customer) { selection.customerId = customer.dataset.customer; selection.view = customer.dataset.view || selection.view; paint(); return; }
    const task = event.target.closest('[data-task]');
    if (task) { update(toggleTask(state, task.dataset.task)); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'takeover') update(toggleTakeover(state, selection.customerId));
    if (action === 'quick-task') { update(createTask(state, selection.customerId, `跟进${customerName(state, selection.customerId)}的咨询`)); selection.view = 'tasks'; paint(); }
    if (action === 'reset') { localStorage.removeItem(storageKey); state = resetState(); selection = { view: 'overview', customerId: state.customers[0].id }; paint(); }
  });

  root.addEventListener('submit', event => {
    if (event.target.id === 'message-form') {
      event.preventDefault();
      const input = event.target.elements.message;
      if (input.value.trim()) update(sendMessage(state, selection.customerId, input.value));
    }
    if (event.target.id === 'task-form') {
      event.preventDefault();
      const form = event.target;
      if (form.elements.title.value.trim()) update(createTask(state, form.elements.customerId.value, form.elements.title.value));
    }
  });
}
