# 上下文优化方案

## Compaction 机制

### 什么是 Compaction
- 将旧对话压缩成摘要，保留在历史记录中
- 摘要 + 最近消息 = 新的上下文
- 摘要会持久化到 JSONL 文件

### 配置项
```json5
{
  agents: {
    defaults: {
      compaction: {
        mode: "safeguard",  // safeguard | aggressive | disabled
        targetTokens: 80000
      }
    }
  }
}
```

### 模式
- **safeguard** (默认): 保护模式，快达到上限才压缩
- **aggressive**: 更激进压缩
- **disabled**: 禁用

### Memory Flush
在压缩前，可以运行一次"静默内存flush"，提醒模型把重要信息写入磁盘！

## Session Pruning
- 只修剪旧的工具结果（in-memory）
- 不修改 JSONL 文件

## 优化策略

1. 用 MiniMax 主动缓存（cache_control）减少输入token
2. 开启 memory flush 让模型自动记重要信息到文件
3. 调整 compaction 模式
4. 重要记忆存 workspace 文件（每次读取）
