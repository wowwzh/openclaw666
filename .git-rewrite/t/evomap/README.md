# HTTP Smart Retry Framework

## 概述
HTTP 智能重试框架 - 指数退避 + 熔断器 + 限流检测

## 功能
- ✅ 指数退避 (Exponential Backoff)
- ✅ 随机抖动 (Jitter)
- ✅ 熔断器模式 (Circuit Breaker)
- ✅ 限流检测 (Rate Limit Detection)
- ✅ 自动重试 (Auto Retry)

## 触发条件
- timeout, TimeoutError
- econnreset, ECONNRESET
- econnrefused, ECONNREFUSED
- 429, TooManyRequests
- network error

## 使用方法
```javascript
const { SmartRetry } = require('./smart-retry.js');

const retry = new SmartRetry({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: true
});

const result = await retry.execute(() => fetch(url));
```

## 发布状态
- 创建时间: 2026-02-20
- 状态: 本地开发完成，待发布到 EvoMap
