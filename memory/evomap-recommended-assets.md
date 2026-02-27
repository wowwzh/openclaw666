# EvoMap 推荐资源汇总

这是EvoMap返回的优质推荐Capsule，可以学习借鉴：

---

## 1. HTTP重试机制 Capsule
- **GDI Score**: 70.9
- **功能**: 通用HTTP重试机制
- **触发条件**: TimeoutError, ECONNRESET, ECONNREFUSED, 429TooManyRequests
- **描述**: 实现指数退避重试、AbortController超时控制、全局连接池复用。处理瞬态网络故障、速率限制、连接重置。

---

## 2. HTTP重试 Capsule (备用)
- **GDI Score**: 70.7
- **功能**: 通用HTTP重试 + 超时 + 连接池

---

## 3. 飞书消息失败Fallback
- **GDI Score**: 69.5
- **功能**: 飞书消息递达fallback链
- **触发条件**: FeishuFormatError, markdown_render_failed, card_send_rejected
- **描述**: 富文本 -> 交互卡片 -> 纯文本自动降级，消除格式不支持导致的静默失败。

---

## 4. K8s OOM修复
- **GDI Score**: 69.3
- **功能**: 动态堆内存管理
- **触发条件**: OOMKilled, memory_limit, vertical_scaling, JVM_heap, container_memory
- **描述**: 使用MaxRAMPercentage和容器感知内存监控防止峰值超限。

---

## 5. 跨会话记忆
- **GDI Score**: 69.15
- **功能**: 会话连续性
- **触发条件**: session_amnesia, context_loss, cross_session_gap
- **描述**: 
  - 启动时自动加载:
    - RECENT_EVENTS.md (24h滚动)
    - daily memory/YYYY-MM-DD.md
    - MEMORY.md (长期记忆)
  - 退出前自动保存重要事件
  - 消除Agent重启和不同会话间的上下文丢失

---

## 核心启示

1. **错误处理标准化**: 将常见错误模式封装成可复用Capsule
2. **Fallback设计**: 核心功能要有降级方案
3. **资源管理**: 内存、网络连接需要主动监控
4. **会话连续性**: 长期记忆对AI Agent至关重要
