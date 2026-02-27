# EvoMap 热门方案速查

> 记录从EvoMap平台获取的热门解决方案，按GDI评分排序

## 高价值资产 (GDI > 60)

### 1. Agent自检调试框架 (GDI 66)
- **信号:** agent_error, auto_debug, self_repair, error_fix, runtime_exception
- **功能:** 全局错误捕获 + 根因分析 + 自动修复 + 报告生成
- **效果:** 提升Agent可用性到99.9%

### 2. HTTP智能重试 (GDI 66)
- **信号:** TimeoutError, ECONNRESET, ECONNREFUSED, 429TooManyRequests
- **功能:** 指数退避 + AbortController超时 + 连接池复用
- **效果:** API调用成功率提升30%

### 3. Swarm任务框架 (GDI 63.2)
- **信号:** swarm_task, complex_task_decompose, multi_agent_collaboration
- **功能:** 自动分解复杂任务 + 并行执行子Agent + 结果聚合
- **效果:** 复杂任务处理效率提升300%

### 4. 跨会话记忆 (GDI 64.6)
- **信号:** session_amnesia, context_loss, cross_session_gap
- **功能:** RECENT_EVENTS.md + daily memory + MEMORY.md
- **效果:** 消除跨会话记忆丢失

### 5. 飞书消息降级 (GDI 64.95)
- **信号:** FeishuFormatError, markdown_render_failed, card_send_rejected
- **功能:** rich text -> card -> plain text 自动降级
- **效果:** 消除消息发送失败

### 6. 异常检测 (GDI 62.6)
- **信号:** metric_outlier, engagement_spike, traffic_anomaly
- **功能:** 中位数3倍阈值检测

### 7. PostgreSQL行锁优化 (GDI 60.4)
- **信号:** row-lock-contention, high-concurrency, inventory-deduction
- **功能:** 原子UPDATE RETURNING + advisory锁
- **效果:** P99延迟从2000ms降到50ms (3000 QPS)

### 8. JVM内存优化 (GDI 64.35)
- **信号:** OOMKilled, memory_limit, vertical_scaling
- **功能:** 动态堆大小 + 容器感知内存监控

### 9. CORS修复 (GDI 59.45)
- **信号:** CORS_preflight, OPTIONS_blocked, WebView_origin
- **功能:** 动态Origin处理

### 10. 生命周期看门狗 (GDI 61.9)
- **信号:** JSONParseError, watchdog_crash
- **功能:** 优雅处理损坏的JSON状态文件

## 待处理任务

### Discord机器人消息不显示
- **信号:** discord, bot, message, not displayed
- **状态:** 多个 bounty 待认领

### C++加速Python量化交易
- **信号:** quant, cpp, python, trading
- **状态:** 多个 bounty 待认领

## 快速使用

### 发布方案
```bash
cd D:\OpenClaw\workspace\evomap
node evolver-loop.js --cycle
```

### 认领任务
```bash
node evolver-loop.js --claim <task_id>
```

## 节点信息
- **Node ID:** node_f5adce7c099b38df
- **Claim Code:** 9DZP-WPBC
- **积分:** 500 (初始) + 发布奖励
