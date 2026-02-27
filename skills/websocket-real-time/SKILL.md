# WebSocket实时通信技能

实现WebSocket双向实时通信，支持自动重连和心跳检测。

## 功能特性

1. **连接管理**
   - 自动连接与断开
   - 心跳保活(ping/pong)
   - 自动重连(指数退避)

2. **消息处理**
   - 文本/二进制消息
   - 消息队列缓冲
   - 断线自动缓存

3. **状态管理**
   - 连接状态监听
   - 错误自动恢复
   - 日志记录

## 使用方法

```typescript
import WebSocketClient from './websocket-client';

const ws = new WebSocketClient('wss://example.com/ws', {
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  heartbeat: true,
  heartbeatInterval: 30000
});

// 连接事件
ws.on('open', () => {
  console.log('Connected');
  ws.send({ type: 'hello' });
});

// 接收消息
ws.on('message', (data) => {
  console.log('Received:', data);
});

// 错误处理
ws.on('error', (error) => {
  console.error('Error:', error);
});

// 断开连接
ws.on('close', () => {
  console.log('Disconnected');
});

// 手动关闭
ws.close();
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | string | - | WebSocket服务器URL |
| reconnect | boolean | true | 是否自动重连 |
| reconnectInterval | number | 1000 | 重连间隔(ms) |
| maxReconnectAttempts | number | 5 | 最大重连次数 |
| heartbeat | boolean | true | 是否发送心跳 |
| heartbeatInterval | number | 30000 | 心跳间隔(ms) |
| protocols | string | - | WebSocket子协议 |

## 心跳机制

```typescript
// 客户端发送ping
this.pingTimer = setInterval(() => {
  if (this.ws.readyState === WebSocket.OPEN) {
    this.ws.send(JSON.stringify({ type: 'ping' }));
  }
}, this.options.heartbeatInterval);

// 服务端响应pong
ws.on('message', (data) => {
  if (data.type === 'ping') {
    ws.send({ type: 'pong' });
  }
});
```

## 重连策略

```typescript
// 指数退避
const getReconnectDelay = (attempt: number) => {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
};

// 最大重试次数后放弃
if (attempt >= maxReconnectAttempts) {
  console.error('Max reconnection attempts reached');
  this.emit('failed', new Error('Max reconnection attempts reached'));
}
```

## 完整示例

```typescript
import WebSocketClient from './websocket-client';

// 创建客户端
const ws = new WebSocketClient('wss://chat.example.com/ws', {
  reconnect: true,
  heartbeat: true,
  heartbeatInterval: 30000
});

// 消息处理
ws.on('message', (data) => {
  if (data.type === 'chat') {
    console.log(`收到消息: ${data.content}`);
  }
});

// 发送消息(自动重连期间缓存)
function sendMessage(content: string) {
  ws.send({
    type: 'chat',
    content,
    timestamp: Date.now()
  });
}

// 优雅关闭
process.on('SIGINT', () => {
  ws.close();
  process.exit(0);
});
```

## 与HTTP对比

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信模式 | 请求-响应 | 双向推送 |
| 连接 | 短连接 | 长连接 |
| 资源 | 每次新建 | 复用连接 |
| 延迟 | 较高 | 极低 |
| 适用场景 | REST API | 实时通信 |

## 依赖

```json
{
  "dependencies": {
    "ws": "^8.0.0"
  }
}
```

## 注意事项

1. 生产环境务必使用WSS(SSL)
2. 设置合理的重连策略
3. 实现心跳检测连接存活
4. 做好错误日志记录
5. 考虑消息可靠性(ACK机制)
