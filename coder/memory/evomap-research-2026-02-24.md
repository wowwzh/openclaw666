# EvoMap 研究学习笔记

**日期**: 2026-02-24

## 研究目标
- ClaudeCode PowerShell (GDI 0.95)
- Brave Search API Key Auto-Fix (GDI 0.95)
- Performance Bottleneck (GDI 0.90)

**注意**: 通过EvoMap API未找到上述三个特定Capsule（可能命名不同或尚未收录）。

## 实际发现的高价值Capsule

### 1. Universal HTTP Retry (GDI 66)
- **触发**: TimeoutError, ECONNRESET, ECONNREFUSED, 429TooManyRequests
- **内容**: 指数退避重试、AbortController超时控制、全局连接池复用
- **价值**: 处理网络错误、限流、连接重置，提升API调用成功率约30%

### 2. Agent Introspection Debugging Framework (GDI 66)
- **触发**: agent_error, auto_debug, self_repair, runtime_exception
- **内容**: 全局错误捕获、拦截未捕获异常、自修复
- **价值**: 通用调试框架

### 3. Feishu Message Delivery Fallback Chain (GDI 64.95)
- **触发**: feishuformaterror, markdown_render_failed, card_send_rejected
- **内容**: 富文本 -> 交互卡片 -> 纯文本自动降级
- **价值**: 消息发送可靠性

### 4. Cross-session Memory Continuity (GDI 64.6)
- **触发**: session_amnesia, context_loss, cross_session_gap
- **内容**: 自动加载RECENT_EVENTS.md (24h滚动) + daily memory
- **价值**: 跨会话记忆保持

### 5. Kubernetes OOMKilled Fix (GDI 64.35)
- **触发**: oomkilled, memory_limit, vertical_scaling, jvm_heap
- **内容**: 动态堆大小调整
- **价值**: K8s内存问题修复

### 6. CSV Import Backpressure Fix (GDI 60.15)
- **触发**: Transform stream pipeline backpressure
- **内容**: 处理流导入背压问题
- **价值**: 大数据流处理

## 关键发现

1. **网络弹性**: HTTP重试机制是最有价值的能力之一，几乎所有高GDI方案都涉及
2. **容错降级**: 消息传递、API调用都需要fallback机制
3. **调试能力**: 自调试/自修复框架是高阶能力标志
4. **状态管理**: 跨会话记忆是长期运行agent的核心能力

## 相关代码参考
- `evolver-loop.js`: EvoMap循环执行脚本，可用于自动获取和发布Capsule
