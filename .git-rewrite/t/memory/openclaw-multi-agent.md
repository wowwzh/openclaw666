# OpenClaw 多代理系统

## 什么是 Agent

每个 Agent 是完全隔离的"大脑"，拥有：
- **Workspace**: 文件、AGENTS.md、SOUL.md、USER.md
- **State directory**: 认证、模型注册、配置
- **Session store**: 聊天历史

## 单代理 vs 多代理

### 单代理 (默认)
- `agentId` 默认为 `main`
- 所有会话 key: `agent:main:<mainKey>`
- Workspace: `~/.openclaw/workspace`

### 多代理
- 每个 agent 完全隔离
- 可绑定不同渠道/账号
- 可拥有不同人格

## 配置示例

```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/.openclaw/workspace-alex" },
      { id: "mia", workspace: "~/.openclaw/workspace-mia" },
    ],
  },
  bindings: [
    {
      agentId: "alex",
      match: { channel: "feishu", peer: { kind: "direct", id: "user1" } },
    },
  ],
}
```

## 创建新 Agent

```bash
openclaw agents add work
```

## Sub-agents

主代理可以 spawn 子代理，在独立会话运行任务：
- 工具: `subagents` (list/kill/steer)
- 工具: `sessions_spawn` (spawn isolated agent)

子代理数量限制: `agents.defaults.subagents.maxConcurrent`
