# API Gateway网关技能

完整的API网关设计与实现。

## 核心功能

1. **路由管理** - 路径/方法/版本路由
2. **负载均衡** - 轮询/最少连接/IP哈希
3. **认证授权** - JWT/API Key/OAuth2
4. **限流熔断** - 防止雪崩
5. **缓存** - 响应缓存
6. **日志监控** - 请求追踪

## 架构

```
Client → Gateway → Auth → Rate Limit → Route → Service
                          ↓
                    Cache/Hystrix
```

## Node.js实现

```javascript
const express = require('express');
const httpProxy = require('http-proxy');
const jwt = require('jsonwebtoken');

const app = express();
const proxy = httpProxy.createProxyServer({});

// 中间件：日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// 路由配置
const routes = {
  '/api/v1/users': 'http://user-service:3001',
  '/api/v1/orders': 'http://order-service:3002',
  '/api/v1/products': 'http://product-service:3003'
};

// 认证中间件
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 限流中间件
const rateLimits = new Map();
function rateLimiter(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const window = 60000;
  const limit = 100;
  
  const record = rateLimits.get(key) || { count: 0, reset: now + window };
  
  if (now > record.reset) {
    record.count = 1;
    record.reset = now + window;
  } else if (record.count >= limit) {
    return res.status(429).json({ error: 'Too many requests' });
  } else {
    record.count++;
  }
  
  rateLimits.set(key, record);
  next();
}

// 路由
app.use('/api', rateLimiter, authenticate, (req, res) => {
  const target = routes[req.path];
  if (!target) return res.status(404).json({ error: 'Not found' });
  
  proxy.web(req, res, { target }, (err) => {
    res.status(502).json({ error: 'Bad gateway' });
  });
});

app.listen(8080);
```

## Kong网关配置

```yaml
_format_version: "3.0"
services:
  - name: user-service
    url: http://user-service:3001
    routes:
      - name: user-route
        paths: ["/api/v1/users"]
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: jwt
      - name: cors

  - name: order-service
    url: http://order-service:3002
    routes:
      - name: order-route
        paths: ["/api/v1/orders"]
    plugins:
      - name: rate-limiting
        config:
          minute: 50
      - name: jwt
```

## 负载均衡

```javascript
// 服务发现
const services = {
  'user-service': ['10.0.1.10:3001', '10.0.1.11:3001', '10.0.1.12:3001']
};

// 轮询
let currentIndex = 0;
function roundRobin(service) {
  const endpoints = services[service];
  const endpoint = endpoints[currentIndex];
  currentIndex = (currentIndex + 1) % endpoints.length;
  return endpoint;
}

// 最少连接
function leastConnections(service) {
  const endpoints = services[service];
  // 返回连接数最少的
}
```

## 熔断器

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit open');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## 响应缓存

```javascript
const cache = new Map();

function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();
  
  const key = req.path;
  const cached = cache.get(key);
  
  if (cached && Date.now() < cached.expires) {
    return res.json(cached.data);
  }
  
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, {
      data,
      expires: Date.now() + 60000 // 1分钟
    });
    return originalJson(data);
  };
  
  next();
}
```

## 监控

```javascript
const metrics = {
  requests: 0,
  errors: 0,
  latency: [],
  byRoute: new Map()
};

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    metrics.requests++;
    metrics.latency.push(Date.now() - start);
    
    const route = metrics.byRoute.get(req.path) || { requests: 0, errors: 0 };
    route.requests++;
    if (res.statusCode >= 400) route.errors++;
    metrics.byRoute.set(req.path, route);
  });
  next();
});
```

## 最佳实践

1. **无状态** - 网关无状态，状态存Redis
2. **超时** - 设置合理的请求超时
3. **重试** - 失败自动重试(幂等操作)
4. **熔断** - 防止级联故障
5. **限流** - 保护后端服务
6. **缓存** - 减少后端压力
7. **监控** - 实时了解网关状态
