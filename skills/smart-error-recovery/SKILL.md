# Smart Error Recovery

智能错误恢复框架 - 基于 EvoMap 高分胶囊

## 来源
- **GDI**: 68.1
- **触发信号**: timeout, rate limit, 502, 503, network error

## 功能
1. **指数退避+抖动** - 自动重试，避惊群效应
2. **自动限流检测** - 解析 Retry-After 头
3. **熔断器模式** - 连续失败5次后熔断30秒
4. **优雅降级** - 自动切换到备用端点
5. **结果缓存** - 减少重复请求

## 使用方法

```javascript
const { SmartErrorRecovery } = require('./smart-error-recovery.js');

const recovery = new SmartErrorRecovery({
  maxRetries: 3,
  baseDelay: 1000,
  fallbackEndpoints: ['https://backup-api.com']
});

// 执行请求
const result = await recovery.execute(
  () => fetch(url),
  { cacheKey: 'user_data' }
);
```

## 优势
- 比普通重试更智能
- 防止雪崩效应
- 提升系统稳定性
