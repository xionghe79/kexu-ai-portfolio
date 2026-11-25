export const demoData = {
  customers: [
    { id: 'C-101', name: '林若溪', company: '星河设计工作室', stage: '方案评估', interest: '团队协作方案', score: 82, owner: '顾问 A', color: '#d6e5dc' },
    { id: 'C-102', name: '周以安', company: '青禾培训中心', stage: '初次咨询', interest: '客户服务自动化', score: 68, owner: '顾问 B', color: '#e8dfd3' },
    { id: 'C-103', name: '许知远', company: '云帆创意团队', stage: '持续跟进', interest: '数据看板', score: 74, owner: '顾问 A', color: '#deddf0' }
  ],
  conversations: {
    'C-101': [
      { id: 'M-1', author: 'customer', text: '我们希望团队能更清楚地跟进客户进度。', at: '2026-11-25T09:42:00+08:00' },
      { id: 'M-2', author: 'demo', text: '可以先梳理客户阶段、负责人和下一步动作，再按团队实际流程配置看板。您现在最想解决哪个环节的跟进问题？', at: '2026-11-25T09:42:00+08:00' }
    ],
    'C-102': [
      { id: 'M-3', author: 'customer', text: '想了解自动回复能处理哪些问题。', at: '2026-11-25T10:18:00+08:00' },
      { id: 'M-4', author: 'demo', text: '演示版会按关键词生成示例回复，并把需要人员处理的问题转到人工队列。您更关注常见问题还是线索分配？', at: '2026-11-25T10:18:00+08:00' }
    ],
    'C-103': [
      { id: 'M-5', author: 'customer', text: '我们下周想看一次演示。', at: '2026-11-24T14:06:00+08:00' },
      { id: 'M-6', author: 'demo', text: '可以先记录演示需求和预期参与人员，再由顾问确认具体时间。', at: '2026-11-24T14:06:00+08:00' }
    ]
  },
  tasks: [
    { id: 'T-1', customerId: 'C-101', title: '发送方案摘要', done: false, due: '2026-11-25' },
    { id: 'T-2', customerId: 'C-102', title: '确认使用场景', done: false, due: '2026-11-26' },
    { id: 'T-3', customerId: 'C-103', title: '整理演示议程', done: true, due: '已完成' }
  ],
  timeline: {
    'C-101': [
      { id: 'E-1', title: '进入方案评估', detail: '已记录团队协作需求', at: '2026-11-25T09:40:00+08:00' },
      { id: 'E-2', title: '咨询会话', detail: '讨论客户跟进流程', at: '2026-11-25T09:42:00+08:00' }
    ],
    'C-102': [{ id: 'E-3', title: '首次咨询', detail: '询问自动回复能力', at: '2026-11-25T10:18:00+08:00' }],
    'C-103': [{ id: 'E-4', title: '演示意向', detail: '计划下周安排产品演示', at: '2026-11-24T14:06:00+08:00' }]
  },
  takeovers: { 'C-101': false, 'C-102': false, 'C-103': false },
  nextId: 10
};
