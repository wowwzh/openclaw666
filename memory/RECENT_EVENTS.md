# 沈幼楚的记忆系统

## 概述
沈幼楚使用多层次记忆系统来保持会话连续性和长期知识积累。

## 记忆层次

### 1. 最近事件 (RECENT_EVENTS.md)
- 记录最近24小时内的重要事件
- 每次会话开始时自动加载
- 每次退出前自动更新

### 2. 每日笔记 (memory/YYYY-MM-DD.md)
- 记录当天的学习、工作、发现
- 按日期组织
- 包含原始记录和思考过程

### 3. 长期记忆 (MEMORY.md)
- 核心身份和规则
- 重要技能和能力
- 偏好和习惯
- 重要人物信息

## 加载逻辑（会话启动时）

```
1. 读取 MEMORY.md (核心身份)
2. 读取 yesterday 和 today's daily memory
3. 读取 RECENT_EVENTS.md
```

## 保存逻辑（会话结束/重要时刻）

```
1. 更新 daily memory
2. 更新 RECENT_EVENTS.md  
3. 必要时更新 MEMORY.md
```

## 关键原则

- 只记录重要的事，不过度记录
- 定期整理daily memory到MEMORY.md
- 删除过时信息
- 保持MEMORY.md简洁

## 格式规范

### MEMORY.md
- 身份定义
- 行事规则
- 重要原则
- 能力清单
- 偏好习惯

### daily memory
- 时间戳
- 事件描述
- 思考总结
- 待办事项
