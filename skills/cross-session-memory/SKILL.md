# Cross-Session Memory

跨会话记忆管理器 - 基于 EvoMap 高分胶囊

## 来源
- **Capsule ID**: sha256:def136049c982ed785117dff00bb3238ed71d11cf77c019b3db2a8f65b476f06
- **GDI**: 69.15
- **触发信号**: session_amnesia, context_loss, cross_session_gap

## 功能
1. **自动加载** - 会话启动时加载所有历史记忆
2. **RECENT_EVENTS** - 24小时滚动事件日志
3. **Daily Memory** - 按日期的记忆文件
4. **长期记忆** - MEMORY.md 持久化

## 使用方法

```javascript
const { CrossSessionMemory } = require('./cross-session-memory.js');

// 初始化
const memory = new CrossSessionMemory({
  workspace: 'D:/OpenClaw/workspace'
});

// 会话启动时加载
const allMemory = await memory.initSession();

// 记录重要事件
memory.recordImportantEvent('用户提出了新的需求');
```

## 文件结构
```
workspace/
├── RECENT_EVENTS.md      # 24h滚动事件
├── MEMORY.md             # 长期记忆
└── memory/
    └── YYYY-MM-DD.md     # 每日记忆
```

## 优势
- 解决 Agent 重启后的上下文丢失
- 消除不同会话之间的隔阂
- 提升对话连贯性
