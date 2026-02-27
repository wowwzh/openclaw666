# Real-time消息推送系统技能

完整的实时消息推送解决方案。

## 架构

```
Client ←→ WebSocket Server ←→ Redis Pub/Sub ←→ Message Queue
                                    ↓
                              Database
```

## Socket.io实现

```javascript
const { Server } = require('socket.io');
const io = new Server(3000, {
  cors: { origin: '*' }
});

// 连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // 加入房间
  socket.on('join', (room) => {
    socket.join(room);
  });
  
  // 发送消息
  socket.on('message', (data) => {
    io.to(data.room).emit('message', data);
  });
  
  // 断开
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
```

## Redis Pub/Sub

```javascript
const redis = require('redis');
const subscriber = redis.createClient();
const publisher = redis.createClient();

// 订阅
subscriber.subscribe('notifications');

// 接收
subscriber.on('message', (channel, message) => {
  console.log('Received:', message);
  io.emit('notification', JSON.parse(message));
});

// 发布
publisher.publish('notifications', JSON.stringify({
  type: 'alert',
  message: 'New order'
}));
```

## 消息队列

```javascript
const amqp = require('amqplib');

async function startConsumer() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  
  await channel.assertQueue('notifications', { durable: true });
  
  channel.consume('notifications', (msg) => {
    if (msg) {
      const notification = JSON.parse(msg.content.toString());
      io.emit('notification', notification);
      channel.ack(msg);
    }
  });
}
```

## 离线消息

```javascript
const offlineMessages = new Map();

// 存储离线消息
function storeOfflineMessage(userId, message) {
  const messages = offlineMessages.get(userId) || [];
  messages.push({ ...message, timestamp: Date.now() });
  offlineMessages.set(userId, messages);
}

// 用户上线时发送
socket.on('online', (userId) => {
  const messages = offlineMessages.get(userId) || [];
  if (messages.length > 0) {
    socket.emit('offlineMessages', messages);
    offlineMessages.delete(userId);
  }
});
```

## 心跳检测

```javascript
// 服务端心跳
setInterval(() => {
  io.emit('ping');
});

socket.on('pong', () => {
  socket.lastSeen = Date.now();
});

// 清理断连
setInterval(() => {
  const now = Date.now();
  for (const [id, socket] of io.sockets.sockets) {
    if (now - socket.lastSeen > 30000) {
      socket.disconnect();
    }
  }
}, 10000);
```

## 消息确认

```javascript
// 发送
socket.emit('message', data, (ack) => {
  if (ack.status === 'ok') {
    console.log('Message delivered');
  }
});

// 接收确认
socket.on('message', (data, ack) => {
  // 处理消息
  ack({ status: 'ok' });
});
```

## 最佳实践

1. **心跳保活** - 检测连接状态
2. **离线消息** - 用户上线发送
3. **消息确认** - 保证送达
4. **房间管理** - 按用户/群组隔离
5. **Redis Pub/Sub** - 多实例消息同步
6. **消息队列** - 异步处理
