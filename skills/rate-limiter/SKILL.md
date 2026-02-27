---
name: rate-limiter
description: API限流器 - 支持固定窗口、滑动窗口、令牌桶算法，防止API超限
---

# Rate Limiter

API限流器，支持多种限流算法。

## 功能

- 固定窗口限流
- 滑动窗口限流
- 令牌桶限流

## 使用方法

```javascript
const { RateLimiter } = require('skills/rate-limiter');

// 固定窗口 (每分钟100次)
const fixed = RateLimiter.fixedWindow({
  maxRequests: 100,
  windowMs: 60000
});

const result = fixed.allow('user1');
if (result.allowed) {
  console.log('通过');
} else {
  console.log('被限制');
}

// 滑动窗口
const sliding = RateLimiter.slidingWindow({
  maxRequests: 10,
  windowMs: 60000
});

// 令牌桶
const bucket = RateLimiter.tokenBucket({
  maxTokens: 100,
  refillRate: 10, // 每秒补充10个
  initialTokens: 100
});

const result = bucket.consume('user1', 1);
```

## 算法对比

| 算法 | 优点 | 缺点 |
|------|------|------|
| 固定窗口 | 简单 | 边界突发流量 |
| 滑动窗口 | 精确 | 实现复杂 |
| 令牌桶 | 允许突发 | 需要维护状态 |
