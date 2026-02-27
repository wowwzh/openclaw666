/**
 * 跨会话记忆模块
 * 
 * 功能：
 * 1. 自动保存最近 24 小时的事件
 * 2. 会话开始时加载历史上下文
 * 3. 智能摘要压缩旧事件
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加便捷函数
 */

/** @typedef {Object} MemoryEvent */
/** @property {string} timestamp - 时间戳 */
/** @property {string} type - 事件类型 */
/** @property {string} content - 事件内容 */

const fs = require('fs');
const path = require('path');

/** @type {string} */
const MEMORY_DIR = process.env.MEMORY_DIR || 'D:/OpenClaw/workspace/memory';
/** @type {string} */
const RECENT_FILE = path.join(MEMORY_DIR, 'RECENT_EVENTS.md');
/** @type {number} */
const MAX_AGE_HOURS = 24;

/**
 * 配置选项
 * @typedef {Object} MemoryOptions
 * @property {string} memoryDir - 记忆目录
 * @property {number} maxAgeHours - 最大保留小时数
 * @property {number} maxEvents - 最大事件数
 */

/**
 * 保存事件到最近记忆
 * @param {string} type - 事件类型
 * @param {string} content - 事件内容
 * @param {Object} metadata - 附加元数据
 * @returns {MemoryEvent}
 */
function saveEvent(type, content, metadata = {}) {
  const timestamp = new Date().toISOString();
  const event = {
    timestamp,
    type,
    content,
    ...metadata
  };

  // 读取现有事件
  let events = [];
  if (fs.existsSync(RECENT_FILE)) {
    try {
      const content = fs.readFileSync(RECENT_FILE, 'utf-8');
      events = parseEvents(content);
    } catch (e) {
      console.error('Failed to read RECENT_FILE:', e.message);
    }
  }

  // 添加新事件
  events.push(event);

  // 过滤过期事件
  events = pruneOldEvents(events);

  // 保存
  const md = formatEvents(events);
  fs.writeFileSync(RECENT_FILE, md, 'utf-8');

  return event;
}

/**
 * 加载最近事件作为上下文
 * @param {number} hours - 加载最近几小时的事件
 * @returns {string} - 格式化的上下文
 */
function loadRecentEvents(hours = MAX_AGE_HOURS) {
  if (!fs.existsSync(RECENT_FILE)) {
    return '';
  }

  try {
    const content = fs.readFileSync(RECENT_FILE, 'utf-8');
    const events = parseEvents(content);
    
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recent = events.filter(e => new Date(e.timestamp).getTime() > cutoff);

    return formatEvents(recent);
  } catch (e) {
    console.error('Failed to load recent events:', e.message);
    return '';
  }
}

/**
 * 解析事件列表
 */
function parseEvents(content) {
  const events = [];
  const lines = content.split('\n');
  let currentEvent = null;

  for (const line of lines) {
    const timeMatch = line.match(/^## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
    if (timeMatch) {
      if (currentEvent) events.push(currentEvent);
      currentEvent = { timestamp: timeMatch[1], content: [] };
    } else if (currentEvent && line.trim()) {
      currentEvent.content.push(line.trim());
    }
  }
  if (currentEvent) events.push(currentEvent);

  return events;
}

/**
 * 格式化事件列表
 */
function formatEvents(events) {
  if (!events || events.length === 0) return '# Recent Events\n\nNo recent events.';
  
  let md = '# Recent Events\n\n';
  for (const event of events) {
    md += `## ${event.timestamp}\n`;
    if (event.type) md += `**Type:** ${event.type}\n\n`;
    if (Array.isArray(event.content)) {
      md += event.content.join('\n') + '\n\n';
    } else if (event.content) {
      md += event.content + '\n\n';
    }
  }
  return md;
}

/**
 * 清理过期事件
 */
function pruneOldEvents(events) {
  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  return events.filter(e => new Date(e.timestamp).getTime() > cutoff);
}

/**
 * 获取智能摘要
 * @param {number} maxEvents - 最多保留多少事件
 * @returns {string} - 摘要
 */
function getSummary(maxEvents = 10) {
  if (!fs.existsSync(RECENT_FILE)) {
    return 'No recent events.';
  }

  try {
    const content = fs.readFileSync(RECENT_FILE, 'utf-8');
    const events = parseEvents(content);
    
    // 保留最近的事件
    const recent = events.slice(-maxEvents);
    
    return formatEvents(recent);
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

module.exports = {
  saveEvent,
  loadRecentEvents,
  getSummary,
  RECENT_FILE,
  MAX_AGE_HOURS,
  // v1.1 便捷函数
  createMemory: (options) => ({
    save: (type, content, meta) => saveEvent(type, content, meta),
    load: (hours) => loadRecentEvents(hours),
    summary: (max) => getSummary(max)
  }),
  clearEvents: () => {
    if (fs.existsSync(RECENT_FILE)) {
      fs.unlinkSync(RECENT_FILE);
    }
  }
};
