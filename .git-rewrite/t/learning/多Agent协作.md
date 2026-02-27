# 多 Agent 协作模式

> 学习时间：2026-02-22

---

## 一、Agent 通信协议

### 1.1 A2A 协议 (Agent-to-Agent)

Google 提出的 Agent 通信标准。

```
┌─────────┐     A2A      ┌─────────┐
│  Agent  │ ←─────────→ │  Agent  │
└─────────┘              └─────────┘
```

**核心特性：**
- JSON-RPC 2.0 消息格式
- 支持流式响应
- 内置任务委托

### 1.2 MCP 协议 (Model Context Protocol)

Anthropic 提出的模型上下文协议。

```
┌─────────┐     MCP      ┌─────────┐
│   LLM   │ ←─────────→ │ Tool/DB │
└─────────┘              └─────────┘
```

**核心特性：**
- 标准化工具接口
- 资源管理
- 提示模板

---

## 二、协作模式

### 2.1 并行模式

多个 Agent 同时工作，结果汇总。

```
     ┌─────────┐
     │  主Agent  │
     └────┬────┘
    ┌─────┼─────┐
    ↓     ↓     ↓
┌────┐ ┌────┐ ┌────┐
│ A1 │ │ A2 │ │ A3 │
└────┘ └────┘ └────┘
    ↓     ↓     ↓
    └─────┼─────┘
          ↓
     ┌─────────┐
     │ 结果汇总 │
     └─────────┘
```

**代码示例：**

```typescript
async function parallelExecute(agents: Agent[], task: string) {
  const results = await Promise.all(
    agents.map(agent => agent.execute(task))
  )
  
  return aggregate(results)
}
```

**适用场景：**
- 多角度分析
- 搜索/调研
- 独立任务

---

### 2.2 串行模式

Agent 按顺序执行，上一个输出作为下一个输入。

```
┌────┐   ┌────┐   ┌────┐   ┌────┐
│ A1  │ → │ A2  │ → │ A3  │ → │ A4 │
└────┘   └────┘   └────┘   └────┘
```

**代码示例：**

```typescript
async function serialExecute(agents: Agent[], initialInput: any) {
  let input = initialInput
  
  for (const agent of agents) {
    input = await agent.execute(input)
  }
  
  return input
}
```

**适用场景：**
- 流水线处理
- 逐步精化
- 依赖任务

---

### 2.3 分层模式

主 Agent 协调子 Agent，形成树状结构。

```
         ┌─────────┐
         │  主Agent  │
         │ (Coordinator)│
         └────┬────┘
    ┌────────┼────────┐
    ↓        ↓        ↓
┌──────┐ ┌──────┐ ┌──────┐
│子Agent│ │子Agent│ │子Agent│
│  A1  │ │  A2  │ │  A3  │
└──────┘ └──────┘ └──────┘
```

**代码示例：**

```typescript
class HierarchicalAgent {
  async execute(task: string) {
    // 主 Agent 分析任务，分发给子 Agent
    const subtasks = await this.coordinator.decompose(task)
    
    // 并行执行子任务
    const results = await Promise.all(
      subtasks.map(st => this.subAgents[st.type].execute(st))
    )
    
    // 汇总结果
    return await this.coordinator.aggregate(results)
  }
}
```

**适用场景：**
- 复杂项目
- 需要多种技能
- 大任务分解

---

### 2.4 讨论模式

Agent 之间相互讨论，达成共识。

```
    ┌─────────┐
    │  主持人  │
    └────┬────┘
    ┌────┴────┐
    ↓         ↓
┌──────┐  ┌──────┐
│ A1   │←→│ A2   │
└──────┘  └──────┘
    ↑         ↑
    └────┬────┘
         ↓
    ┌─────────┐
    │  共识   │
    └─────────┘
```

**代码示例：**

```typescript
async function discuss(agents: Agent[], topic: string) {
  let context = { topic, messages: [] }
  
  for (let round = 0; round < 3; round++) {
    for (const agent of agents) {
      const response = await agent.respond(context)
      context.messages.push({ agent: agent.name, response })
    }
  }
  
  return consensus(context.messages)
}
```

**适用场景：**
- 多角度分析
- 决策制定
- 创意生成

---

## 三、任务分配策略

### 3.1 基于能力匹配

```typescript
function matchAgent(task: Task, agents: Agent[]): Agent {
  return agents
    .filter(a => a.capabilities.includes(task.requiredSkill))
    .sort((a, b) => b.successRate - a.successRate)[0]
}
```

### 3.2 基于负载均衡

```typescript
function selectAgent(agents: Agent[]): Agent {
  return agents
    .filter(a => a.currentLoad < a.maxLoad)
    .sort((a, b) => a.currentLoad - b.currentLoad)[0]
}
```

### 3.3 基于历史表现

```typescript
function selectBestAgent(task: Task, agents: Agent[]): Agent {
  const history = getTaskHistory(task.type)
  
  return agents
    .map(a => ({
      agent: a,
      score: calculateSuccessRate(a, history)
    }))
    .sort((a, b) => b.score - a.score)[0].agent
}
```

---

## 四、实战案例

### 4.1 智能客服系统

```
┌─────────────────────────────────────────┐
│            意图识别 Agent               │
└────────────────┬──────────────────────┘
                 ↓
    ┌────────────┼────────────┐
    ↓            ↓            ↓
┌───────┐  ┌──────────┐  ┌───────┐
│查询Agent│  │办理Agent  │  │闲聊Agent│
└───┬───┘  └────┬─────┘  └───┬───┘
    ↓            ↓            ↓
  ┌─┴─┐      ┌──┴──┐       └─────┐
  │DB │      │业务 │            └─────┘
  └─┘       └─────┘
```

### 4.2 代码审查系统

```
┌────────────────────────────────────────┐
│            任务分发 Agent              │
└─────────────────┬──────────────────────┘
                  ↓
     ┌────────────┼────────────┐
     ↓            ↓            ↓
┌────────┐  ┌────────┐  ┌────────┐
│语法检查│  │安全检查│  │性能检查│
│ Linter │  │  Sonar │  │  Perf  │
└────────┘  └────────┘  └────────┘
     ↓            ↓            ↓
     └────────────┼────────────┘
                 ↓
         ┌──────────────┐
         │  报告生成    │
         └──────────────┘
```

---

## 五、总结

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 并行 | 快 | 需要汇总 | 调研/搜索 |
| 串行 | 简单 | 慢 | 流水线 |
| 分层 | 可扩展 | 复杂 | 大项目 |
| 讨论 | 多角度 | 难收敛 | 决策 |

**最佳实践：**
1. 优先简单模式
2. 根据场景选择
3. 做好错误处理
4. 监控性能
