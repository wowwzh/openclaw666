# Microservices微服务架构技能

完整的微服务设计与实现指南。

## 架构原则

1. **单一职责** - 每个服务只做一件事
2. **松耦合** - 服务间通过API通信
3. **高内聚** - 相关功能在一起
4. **独立部署** - 每个服务可独立部署
5. **去中心化** - 不共享数据库

## 服务拆分

```
 monolith → modules → microservices

用户服务: /api/users
订单服务: /api/orders  
产品服务: /api/products
支付服务: /api/payments
通知服务: /api/notifications
```

## 通信模式

### 1. 同步 (REST/gRPC)

```javascript
// REST
const response = await fetch('http://order-service:3001/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order)
});

// gRPC
const client = new OrderServiceClient('order-service:3001');
const order = await client.CreateOrder(request);
```

### 2. 异步 (Message Queue)

```javascript
// RabbitMQ
const channel = await connection.createChannel();
await channel.assertQueue('order_created', { durable: true });
channel.sendToQueue('order_created', Buffer.from(JSON.stringify(order)));

// 消费者
channel.consume('order_created', async (msg) => {
  const order = JSON.parse(msg.content);
  await processOrder(order);
  channel.ack(msg);
});
```

## 服务发现

```javascript
// Consul服务注册
const consul = require('consul')({ host: 'consul', port: 8500 });

await consul.agent.service.register({
  id: 'user-service-1',
  name: 'user-service',
  address: 'user-service',
  port: 3001,
  check: {
    http: 'http://user-service:3001/health',
    interval: '10s'
  }
});

// 服务发现
const services = await consul.health.service('user-service', null, { passing: true });
const endpoint = services[0].Service.Address + ':' + services[0].Service.Port;
```

## 分布式事务

### Saga模式

```javascript
// 订单创建Saga
const createOrderSaga = [
  {
    step: 'createOrder',
    service: 'order-service',
    action: async () => {
      const order = await Order.create({ status: 'PENDING' });
      return { orderId: order.id };
    },
    compensation: async (orderId) => {
      await Order.update({ id: orderId, status: 'CANCELLED' });
    }
  },
  {
    step: 'reserveInventory',
    service: 'inventory-service',
    action: async ({ orderId }) => {
      await Inventory.reserve(orderId);
    },
    compensation: async ({ orderId }) => {
      await Inventory.release(orderId);
    }
  },
  {
    step: 'processPayment',
    service: 'payment-service',
    action: async ({ orderId }) => {
      await Payment.process(orderId);
    },
    compensation: async ({ orderId }) => {
      await Payment.refund(orderId);
    }
  }
];

// 执行Saga
async function executeSaga(steps, data) {
  const completed = [];
  try {
    for (const step of steps) {
      const result = await step.action(data);
      data = { ...data, ...result };
      completed.push(step);
    }
  } catch (e) {
    // 回滚
    for (const step of completed.reverse()) {
      await step.compensation(data);
    }
    throw e;
  }
}
```

## 熔断与容错

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(callPaymentService, options);

breaker.on('open', () => console.log('Circuit OPEN'));
breaker.on('close', () => console.log('Circuit CLOSED'));

const result = await breaker.fire(paymentData);
```

## 配置管理

```javascript
// Consul KV
const config = await consul.kv.get('app/config', { parseJSON: true });

// Spring Cloud Config风格
const configs = {
  development: { db: 'localhost' },
  production: { db: 'prod-db' }
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = configs[env];
```

## 容器化

```yaml
# docker-compose.yml
version: '3.8'
services:
  user-service:
    build: ./user-service
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  order-service:
    build: ./order-service
    depends_on:
      - rabbitmq
      - postgres

  api-gateway:
    build: ./gateway
    ports:
      - "8080:8080"
```

## 链路追踪

```javascript
const { JaegerTracer } = require('jaeger-client');

const tracer = new JaegerTracer({
  serviceName: 'order-service',
  sampler: { type: 'const', param: 1 }
});

app.use((req, res, next) => {
  const span = tracer.startSpan(req.path);
  span.setTag('http.method', req.method);
  span.setTag('http.url', req.url);
  
  res.on('finish', () => {
    span.setTag('http.status_code', res.statusCode);
    span.finish();
  });
  
  next();
});
```

## 健康检查

```javascript
app.get('/health', async (req, res) => {
  const checks = {
    db: await checkDatabase(),
    redis: await checkRedis(),
    external: await checkExternalService()
  };
  
  const healthy = Object.values(checks).every(c => c);
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks
  });
});
```

## 最佳实践

1. **API版本化** - /api/v1/users
2. **超时设置** - 合理设置各服务超时
3. **重试策略** - 指数退避
4. **降级** - 失败返回默认/缓存
5. **监控** - 指标/日志/追踪
6. **安全** - mTLS服务间通信
