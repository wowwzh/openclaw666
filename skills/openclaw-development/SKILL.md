# OpenClaw 源码修改指南

## 源码结构

```
D:\OpenClaw\openclaw-main\src\
├── agents/          # Agent 核心逻辑
├── channels/        # 通道集成 (飞书/Telegram/Discord等)
├── cron/            # 定时任务系统
├── sessions/        # 会话管理
├── gateway/         # 网关核心
├── commands/        # CLI 命令
├── plugins/         # 插件系统
├── config/          # 配置管理
└── ...
```

## 常用模块

### 1. Cron 定时任务
**路径:** `src/cron/service.ts`

```typescript
// 创建 cron 任务
const job = {
  id: 'my-job',
  name: 'My Job',
  schedule: { kind: 'every', everyMs: 60000 }, // 每分钟
  payload: { kind: 'agentTurn', message: '执行任务' },
  delivery: { mode: 'announce', channel: 'feishu' }
};

// 启用/禁用
openclaw cron enable <job-id>
openclaw cron disable <job-id>

// 手动运行
openclaw cron run <job-id>
```

### 2. Channels 通道
**路径:** `src/channels/`

```typescript
// 飞书通道
src/channels/feishu/

// 发送消息
const result = await channel.send({
  to: 'user_id',
  message: 'Hello',
  channel: 'feishu'
});
```

### 3. Sessions 会话管理
**路径:** `src/sessions/`

```typescript
// 列出活动会话
openclaw sessions list

// 发送消息到会话
openclaw sessions send <session-key> "message"
```

## 源码修改步骤

### 1. 修改现有代码
```bash
# 1. 进入源码目录
cd D:\OpenClaw\openclaw-main

# 2. 修改源码 (TypeScript)
src/cron/service.ts

# 3. 重新构建
npm run build

# 4. 重启 Gateway
openclaw gateway restart
```

### 2. 创建插件
```bash
# 插件目录结构
extensions/
└── my-plugin/
    ├── index.ts          # 入口
    ├── openclaw.plugin.json  # 插件配置
    └── skills/           # 技能目录
```

**openclaw.plugin.json 示例:**
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description custom": "My plugin",
  "entry": "index.ts",
  "skills": ["skills"]
}
```

### 3. 添加 Cron 任务
在代码中创建或通过 CLI:
```bash
# 列出所有 cron
openclaw cron list --all

# 查看特定 cron 详情
openclaw cron list --all --json | grep "job-name"
```

## 调试技巧

### 1. 查看日志
```bash
# Gateway 日志
type %TEMP%\openclaw\openclaw-2026-02-27.log

# 或使用
openclaw gateway logs
```

### 2. 前台运行
```bash
# 查看 Gateway 实时输出
openclaw gateway
```

### 3. 进程管理
```bash
# 查看状态
openclaw gateway status

# 重启
openclaw gateway restart

# 停止
openclaw gateway stop
```

## 常见修改场景

### 1. 修改 Cron 执行逻辑
文件: `src/cron/service.ts`
- 修改调度逻辑
- 改变执行方式

### 2. 修改消息发送
文件: `src/channels/feishu/send.ts`
- 修改消息格式
- 添加新字段

### 3. 修改 Agent 行为
文件: `src/agents/`

### 4. 添加新通道
在 `src/channels/` 下新增目录

## 构建命令

```bash
# 开发模式 (watch)
npm run dev

# 构建
npm run build

# 类型检查
npm run check
```

## 参考资源

- 官方文档: https://docs.openclaw.ai
- 插件开发: https://docs.openclaw.ai/plugins
- CLI 命令: https://docs.openclaw.ai/reference/cli
