# Agent 设计模式

> 学习时间：2026-02-22

---

## 一、ReAct 模式 (Reasoning + Action)

### 1.1 原理

ReAct 让 Agent 交替进行**推理**和**行动**，通过行动获取外部信息来辅助推理。

### 1.2 流程

```
观察 → 思考 → 行动 → 观察 → 思考 → ...
```

### 1.3 代码示例

```typescript
async function reactAgent(query: string, tools: Tool[]) {
  let thought = ""
  let action = null
  let observation = ""
  
  for (let i = 0; i < 5; i++) {
    // 思考
    thought = await llm.generate(`
      Query: ${query}
      Thought: ${thought}
      Action: ${action}
      Observation: ${observation}
      What's the next thought?
    `)
    
    // 解析行动
    const parsed = parseThought(thought)
    if (parsed.action) {
      // 执行行动
      action = parsed.action
      observation = await executeTool(action, tools)
    } else {
      // 完成
      return thought
    }
  }
}
```

### 1.4 适用场景
- 需要外部工具的复杂推理
- 搜索引擎问答
- 数学计算

---

## 二、CoT 模式 (Chain of Thought)

### 2.1 原理

通过提示让模型**逐步思考**，展示推理过程。

### 2.2 提示词模板

```
问题: xxx
让我们一步步思考:
1. ...
2. ...
3. ...
因此答案是: ...
```

### 2.3 代码示例

```typescript
async function cotGenerate(prompt: string) {
  const cotPrompt = `
    ${prompt}
    
    Let's think step by step.
  `
  return await llm.generate(cotPrompt)
}
```

### 2.4 适用场景
- 数学推理
- 逻辑分析
- 复杂决策

---

## 三、Tool Use 模式

### 3.1 原理

模型主动**调用工具**来完成任务，工具作为模型能力的扩展。

### 3.2 架构

```
LLM → Tool Call → Execute → Result → LLM
```

### 3.3 代码示例

```typescript
const tools = [
  {
    name: "search",
    description: "Search the web for information",
    parameters: { query: "string" }
  },
  {
    name: "calculator",
    description: "Calculate mathematical expressions",
    parameters: { expression: "string" }
  }
]

async function toolUseAgent(query: string) {
  // 获取工具调用
  const toolCall = await llm.generateWithTools(query, tools)
  
  if (toolCall) {
    // 执行工具
    const result = await execute(toolCall)
    // 整合结果
    return await llm.generate(`
      Query: ${query}
      Tool Result: ${result}
      Final Answer:
    `)
  }
  
  return toolCall.response
}
```

### 3.4 适用场景
- 需要实时信息
- 需要计算能力
- 需要操作外部系统

---

## 四、Reflexion 模式

### 4.1 原理

Agent 在完成任务后**反思**自己的行为，不断改进。

### 4.2 流程

```
执行 → 评估 → 反思 → 改进 → 重新执行
```

### 4.3 代码示例

```typescript
async function reflexionAgent(task: string) {
  let attempt = 0
  let result = null
  
  while (attempt < 3) {
    // 执行
    result = await execute(task)
    
    // 评估
    const evaluation = await evaluate(result, task)
    
    if (evaluation.success) {
      return result
    }
    
    // 反思
    const reflection = await llm.generate(`
      Task: ${task}
      Result: ${result}
      Error: ${evaluation.error}
      What went wrong and how to fix?
    `)
    
    // 改进
    task = improve(task, reflection)
    attempt++
  }
  
  return result
}
```

### 4.4 适用场景
- 代码生成
- 复杂任务
- 需要迭代优化

---

## 五、模式对比

| 模式 | 特点 | 适用场景 |
|------|------|----------|
| ReAct | 推理+行动交替 | 需要外部信息 |
| CoT | 展示思考过程 | 复杂推理 |
| Tool Use | 工具扩展能力 | 需要执行操作 |
| Reflexion | 自我反思改进 | 迭代优化 |

---

## 六、组合使用

实际应用中常常**组合多种模式**：

```typescript
// ReAct + Tool Use + Reflexion
async function advancedAgent(query: string) {
  let state = { query, attempts: 0 }
  
  while (state.attempts < 3) {
    // ReAct: 思考 + 行动
    const { thought, action } = await reactStep(state)
    
    // Tool Use: 执行工具
    if (action) {
      const observation = await executeTool(action)
      state = { ...state, thought, observation }
    }
    
    // Reflexion: 反思
    const reflection = await reflect(state)
    if (reflection.success) {
      return reflection.result
    }
    
    state.attempts++
  }
}
```
