# API Rate Limiter限流器技能

完整的API限流解决方案，支持分布式环境。

## 限流算法

### 1. 固定窗口

```
时间窗口: 60秒
限制: 100请求

优点: 简单
缺点: 边界突发流量
```

### 2. 滑动窗口

```
更平滑的限流
减少边界突发
```

### 3. 令牌桶

```
桶容量: 100令牌
添加速度: 10令牌/秒

优点: 允许突发流量
```

### 4. 漏桶

```
处理速度恒定
平滑输出
```

## Redis分布式限流

```javascript
const Redis = require('ioredis');
const redis = new Redis();

async function rateLimit(key, limit, window) {
  const now = Date.now();
  const windowStart = now - window * 1000;
  
  // 移除旧记录
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // 检查当前请求数
  const count = await redis.zcard(key);
  
  if (count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil(window - (now - windowStart) / 1000) };
  }
  
  // 添加新请求
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, window);
  
  return { allowed: true, remaining: limit - count - 1 };
}
```

## Express中间件

```javascript
function rateLimiter(options = {}) {
  const { 
    windowMs = 60000,  // 1分钟
    max = 100,         // 最大请求数
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;
  
  return async (req, res, next) => {
    const key = keyGenerator(req);
    const result = await rateLimit(key, max, windowMs / 1000);
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: result.retryAfter
      });
    }
    
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    next();
  };
}

// 使用
app.use('/api', rateLimiter({ windowMs: 60000, max: 100 }));
```

## 动态限流

```javascript
class DynamicRateLimiter {
  constructor(redis) {
    this.redis = redis;
  }
  
  async check(userId, endpoint) {
    // 根据用户等级动态调整限流
    const userLevel = await this.getUserLevel(userId);
    const limits = {
      free: { window: 60, max: 10 },
      basic: { window: 60, max: 60 },
      premium: { window: 60, max: 200 }
    };
    
    const { window, max } = limits[userLevel];
    return this.rateLimit(`${userId}:${endpoint}`, max, window);
  }
  
  async getUserLevel(userId) {
    const level = await this.redis.hget(`user:${userId}`, 'level');
    return level || 'free';
  }
}
```

## IP限流

```javascript
function ipRateLimiter() {
  return rateLimiter({
    keyGenerator: (req) => `ip:${req.ip}`,
    max: 50,
    windowMs: 60 * 1000
  });
}

// 白名单
function whitelistRateLimiter() {
  const whitelist = ['127.0.0.1', '192.168.1.1'];
  
  return (req, res, next) => {
    if (whitelist.includes(req.ip)) {
      return next();
    }
    return ipRateLimiter()(req, res, next);
  };
}
```

## 用户限流

```javascript
function userRateLimiter() {
  return rateLimiter({
    keyGenerator: (req) => `user:${req.user.id}`,
    max: 1000,
    windowMs: 60 * 1000
  });
}

// 需要认证
app.use('/api/user', authenticate, userRateLimiter());
```

## 分布式锁防刷

```javascript
async function withLock(key, fn, ttl = 5000) {
  const lockKey = `lock:${key}`;
  const lockValue = Date.now();
  
  // 尝试获取锁
  const acquired = await redis.set(lockKey, lockValue, 'NX', 'PX', ttl);
  
  if (!acquired) {
    throw new Error('Resource is locked');
  }
  
  try {
    return await fn();
  } finally {
    await redis.del(lockKey);
  }
}

// 使用
app.post('/api/submit', async (req, res) => {
  try {
    const result = await withLock(`submit:${req.user.id}`, async () => {
      return processSubmission(req.body);
    });
    res.json(result);
  } catch (e) {
    res.status(409).json({ error: 'Please try again' });
  }
});
```

## 监控与告警

```javascript
const metrics = {
  requests: 0,
  blocked: 0,
  byIp: new Map()
};

async function monitor(key, allowed) {
  metrics.requests++;
  if (!allowed) metrics.blocked++;
  
  const count = metrics.byIp.get(key) || { total: 0, blocked: 0 };
  count.total++;
  if (!allowed) count.blocked++;
  
  // 告警
  if (count.blocked / count.total > 0.5) {
    sendAlert(`IP ${key} blocking rate > 50%`);
  }
}
```

## 配置示例

```javascript
module.exports = {
  // 全局限流
  global: {
    windowMs: 60000,
    max: 1000
  },
  
  // 登录接口
  login: {
    windowMs: 900000, // 15分钟
    max: 5,
    skipSuccessfulRequests: true
  },
  
  // API接口
  api: {
    windowMs: 60000,
    max: 100,
    keyGenerator: (req) => req.user?.id || req.ip
  },
  
  // 下载
  download: {
    windowMs: 3600000, // 1小时
    max: 10
  }
};
```

## 最佳实践

1. **返回标准头**: X-RateLimit-Limit, X-RateLimit-Remaining
2. **区分用户**: 按用户ID限流优先于IP
3. **动态调整**: 根据用户等级调整限流
4. **监控告警**: 记录限流事件，及时发现攻击
5. **白名单**: 重要接口考虑白名单
6. **分布式**: 使用Redis实现分布式限流
