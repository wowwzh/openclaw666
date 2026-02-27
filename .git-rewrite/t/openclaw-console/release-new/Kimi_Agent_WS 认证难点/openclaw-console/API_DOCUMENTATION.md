# OpenClaw Gateway WebSocket API 文档

> 基于官方文档: https://docs.openclaw.ai/gateway/protocol
> 协议版本: 3

## 目录

- [协议概述](#协议概述)
- [认证机制](#认证机制)
- [连接流程](#连接流程)
- [消息格式](#消息格式)
- [RPC 方法列表](#rpc-方法列表)
- [事件列表](#事件列表)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

---

## 协议概述

OpenClaw Gateway 使用 **JSON-RPC 2.0 over WebSocket** 协议进行通信。

### 基本特性

| 特性 | 说明 |
|------|------|
| 传输协议 | WebSocket (ws:// 或 wss://) |
| 消息格式 | JSON 文本帧 |
| 默认端口 | 18789 |
| 协议版本 | 3 |
| 认证方式 | Token + Challenge-Response |

### 端点地址

```
ws://127.0.0.1:18789        # 本地开发
wss://your-domain.com/ws    # 生产环境 (HTTPS)
```

---

## 认证机制

### Token 认证

Gateway 支持两种认证方式:

1. **Token 认证** (推荐)
   - 通过环境变量 `OPENCLAW_GATEWAY_TOKEN` 设置
   - 或在 `connect` 请求中传递 `auth.token`

2. **Password 认证**
   - 通过环境变量 `OPENCLAW_GATEWAY_PASSWORD` 设置
   - 配置文件中设置 `gateway.auth.mode: "password"`

### Challenge-Response 流程

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Gateway │
└────┬────┘                              └────┬────┘
     │                                        │
     │ ──────── WebSocket 连接 ─────────────> │
     │                                        │
     │ <──────── connect.challenge ────────── │
     │         { nonce, ts }                  │
     │                                        │
     │ ──────────── connect ────────────────> │
     │         { auth.token, device, ... }    │
     │                                        │
     │ <──────────── hello-ok ─────────────── │
     │         { protocol, policy, auth }     │
     │                                        │
```

### 设备配对

- 新设备首次连接需要显式批准
- 本地连接 (loopback) 可配置自动批准
- 远程连接必须签名 challenge nonce
- 配对成功后返回 `deviceToken` 用于后续连接

---

## 连接流程

### 1. 建立 WebSocket 连接

```javascript
const ws = new WebSocket('ws://127.0.0.1:18789');
```

### 2. 等待 Challenge

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'event' && message.event === 'connect.challenge') {
    const { nonce, ts } = message.payload;
    // 保存 nonce，准备发送 connect 请求
  }
};
```

### 3. 发送 Connect 请求

```javascript
const connectRequest = {
  type: 'req',
  id: 'connect_1',
  method: 'connect',
  params: {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'my-client',
      version: '1.0.0',
      platform: 'web',
      mode: 'ui',
      instanceId: 'unique-instance-id'
    },
    role: 'operator',
    scopes: ['operator.read', 'operator.write', 'operator.admin'],
    caps: [],
    auth: {
      token: 'your-gateway-token'
    },
    device: {
      id: 'device-id',
      nonce: challengeNonce,
      signedAt: Date.now()
    }
  }
};

ws.send(JSON.stringify(connectRequest));
```

### 4. 等待 Hello-Ok 响应

```javascript
// 响应格式
{
  type: 'res',
  id: 'connect_1',
  ok: true,
  payload: {
    type: 'hello-ok',
    protocol: 3,
    policy: {
      tickIntervalMs: 15000
    },
    auth: {
      deviceToken: 'issued-device-token',
      role: 'operator',
      scopes: ['operator.read', 'operator.write']
    }
  }
}
```

---

## 消息格式

### 请求消息

```typescript
{
  type: 'req',
  id: string,        // 唯一请求 ID
  method: string,    // RPC 方法名
  params: object     // 方法参数
}
```

### 响应消息

```typescript
{
  type: 'res',
  id: string,        // 对应请求 ID
  ok: boolean,       // 是否成功
  payload?: object,  // 成功时的数据
  error?: {          // 失败时的错误
    code: string,
    message: string,
    details?: unknown
  }
}
```

### 事件消息

```typescript
{
  type: 'event',
  event: string,     // 事件名称
  payload: object,   // 事件数据
  seq?: number,      // 序列号
  stateVersion?: number
}
```

---

## RPC 方法列表

### 系统状态

#### `status`
获取 Gateway 运行状态

**参数:**
```json
{
  "includeHealth": true  // 可选，是否包含健康信息
}
```

**返回:**
```json
{
  "runtime": "running",
  "version": "2026.2.21",
  "uptime": 3600000,
  "pid": 12345,
  "rpcProbe": "ok",
  "health": {
    "status": "healthy",
    "checks": {
      "channels": true,
      "agent": true,
      "memory": true
    },
    "memory": {
      "used": 104857600,
      "total": 1073741824,
      "percentage": 9.8
    }
  }
}
```

#### `health`
健康检查

**参数:** `{}`

**返回:** 健康状态对象

---

### 频道管理

#### `channels.list`
获取频道列表

**参数:**
```json
{
  "includeDisabled": false  // 可选，是否包含禁用的频道
}
```

**返回:**
```json
[
  {
    "channelId": "telegram:default",
    "account": "default",
    "name": "My Telegram Bot",
    "enabled": true,
    "status": "connected",
    "type": "telegram",
    "capabilities": ["text", "image", "voice"]
  }
]
```

#### `channels.stats`
获取频道统计

**参数:**
```json
{
  "channelId": "telegram:default"  // 可选，不传返回所有频道
}
```

**返回:**
```json
{
  "channelId": "telegram:default",
  "messagesReceived": 1000,
  "messagesSent": 500,
  "errors": 2,
  "lastActivity": 1704067200000,
  "connectionTime": 3600000
}
```

#### `channels.status`
获取频道状态

**参数:** `{}`

**返回:** 频道状态对象

---

### Cron 任务

#### `cron.list`
获取 Cron 任务列表

**参数:**
```json
{
  "includeDisabled": true
}
```

**返回:**
```json
[
  {
    "jobId": "cron_123",
    "name": "Daily Report",
    "enabled": true,
    "schedule": {
      "kind": "cron",
      "expr": "0 9 * * *",
      "tz": "Asia/Shanghai"
    },
    "sessionTarget": "isolated",
    "wakeMode": "now",
    "payload": {
      "kind": "agentTurn",
      "message": "Generate daily report"
    },
    "runCount": 10,
    "lastRun": 1703980800000,
    "nextRun": 1704067200000
  }
]
```

#### `cron.toggle`
切换 Cron 任务状态

**参数:**
```json
{
  "jobId": "cron_123",
  "enabled": false
}
```

**返回:** `null`

#### `cron.add`
添加 Cron 任务

**参数:**
```json
{
  "name": "Reminder",
  "schedule": {
    "kind": "at",
    "atMs": 1738262400000
  },
  "sessionTarget": "main",
  "wakeMode": "now",
  "payload": {
    "kind": "systemEvent",
    "text": "Reminder text"
  },
  "deleteAfterRun": true
}
```

#### `cron.remove`
删除 Cron 任务

**参数:**
```json
{
  "jobId": "cron_123"
}
```

---

### 会话管理

#### `sessions.list`
获取会话列表

**参数:**
```json
{
  "filter": "active"  // "active" | "all"
}
```

**返回:**
```json
[
  {
    "sessionKey": "main",
    "type": "main",
    "agentId": "main",
    "createdAt": 1703980800000,
    "lastActivity": 1704067200000,
    "messageCount": 100
  }
]
```

#### `sessions.send`
发送消息到会话

**参数:**
```json
{
  "sessionKey": "main",
  "message": "Hello",
  "idempotencyKey": "unique-key"
}
```

---

### Agent 管理

#### `agents.list`
获取 Agent 列表

**参数:** `{}`

**返回:**
```json
[
  {
    "agentId": "main",
    "workspace": "~/.openclaw/workspace",
    "model": {
      "primary": "anthropic/claude-opus-4-6"
    },
    "status": "idle"
  }
]
```

#### `agents.describe`
获取 Agent 详情

**参数:**
```json
{
  "id": "main"
}
```

#### `agent.run`
运行 Agent

**参数:**
```json
{
  "agentId": "main",
  "sessionKey": "main",
  "prompt": "Do something",
  "idempotencyKey": "unique-key"
}
```

---

### 聊天

#### `chat.send`
发送聊天消息

**参数:**
```json
{
  "sessionKey": "main",
  "message": "Hello",
  "idempotencyKey": "unique-key"
}
```

---

### 配置管理

#### `config.get`
获取配置

**参数:**
```json
{
  "path": "gateway.port"  // 可选，获取特定路径
}
```

**返回:** 配置对象

#### `config.patch`
部分更新配置

**参数:**
```json
{
  "gateway": {
    "port": 19000
  }
}
```

**注意:** 此接口限流，每分钟最多 3 次调用

---

### 系统

#### `system.evolver_status`
获取 Evolver 状态

**参数:** `{}`

**返回:**
```json
{
  "version": "2026.2.21",
  "updateAvailable": true,
  "latestVersion": "2026.2.22",
  "releaseNotes": "...",
  "lastCheck": 1704067200000
}
```

#### `logs.tail`
获取日志

**参数:**
```json
{
  "sinceMs": 60000  // 最近 60 秒
}
```

---

### 节点管理

#### `nodes.list`
获取节点列表

**参数:** `{}`

#### `nodes.invoke`
调用节点

**参数:**
```json
{
  "nodeId": "node_123",
  "command": "system.run",
  "params": {}
}
```

---

### 审批

#### `exec.approval.resolve`
解决执行审批请求

**参数:**
```json
{
  "requestId": "req_123",
  "approved": true
}
```

---

## 事件列表

### 系统事件

| 事件名 | 说明 |  payload |
|--------|------|----------|
| `connect.challenge` | 连接挑战 | `{ nonce, ts }` |
| `tick` | 心跳 tick | `{ timestamp, stateVersion }` |
| `presence` | 在线状态 | `{ online, lastSeen }` |

### Agent 事件

| 事件名 | 说明 | payload |
|--------|------|---------|
| `agent` | Agent 运行状态 | `AgentRun` |
| `agent.output` | Agent 输出 | `{ runId, output }` |
| `agent.complete` | Agent 完成 | `{ runId, status, summary }` |

### 会话事件

| 事件名 | 说明 | payload |
|--------|------|---------|
| `session` | 会话更新 | `Session` |
| `message` | 新消息 | `{ sessionKey, message }` |

### 审批事件

| 事件名 | 说明 | payload |
|--------|------|---------|
| `exec.approval.requested` | 审批请求 | `{ requestId, tool, params }` |

---

## 错误处理

### 错误码

| 错误码 | 说明 |
|--------|------|
| `UNAUTHORIZED` | 认证失败 |
| `INVALID_PROTOCOL` | 协议版本不匹配 |
| `METHOD_NOT_FOUND` | 方法不存在 |
| `INVALID_PARAMS` | 参数无效 |
| `INTERNAL_ERROR` | 内部错误 |
| `TIMEOUT` | 请求超时 |
| `RATE_LIMITED` | 请求过于频繁 |

### 错误响应示例

```json
{
  "type": "res",
  "id": "req_123",
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid authentication token",
    "details": null
  }
}
```

---

## 最佳实践

### 1. 重连机制

```javascript
class GatewayClient {
  constructor(config) {
    this.config = {
      reconnect: {
        enabled: true,
        initialDelay: 1000,
        maxDelay: 30000,
        maxRetries: 10,
        jitter: 0.1
      },
      ...config
    };
    this.reconnectAttempt = 0;
  }

  scheduleReconnect() {
    if (this.reconnectAttempt >= this.config.reconnect.maxRetries) {
      throw new Error('Max reconnection attempts reached');
    }

    const delay = Math.min(
      this.config.reconnect.initialDelay * Math.pow(2, this.reconnectAttempt),
      this.config.reconnect.maxDelay
    );
    const jitter = delay * this.config.reconnect.jitter * (Math.random() * 2 - 1);
    const finalDelay = Math.max(0, delay + jitter);

    setTimeout(() => this.connect(), finalDelay);
    this.reconnectAttempt++;
  }
}
```

### 2. 心跳检测

```javascript
startHeartbeat(interval) {
  this.heartbeatTimer = setInterval(() => {
    this.call('health', {}).catch(() => {
      this.ws.close();
    });
  }, interval);

  this.heartbeatTimeout = setTimeout(() => {
    this.ws.close();
  }, interval + this.config.heartbeat.timeout);
}
```

### 3. 请求去重

```javascript
async call(method, params) {
  const id = this.generateId();
  const idempotencyKey = `${method}_${JSON.stringify(params)}`;
  
  // 检查是否有进行中的相同请求
  if (this.pendingRequests.has(idempotencyKey)) {
    return this.pendingRequests.get(idempotencyKey);
  }

  const promise = this.sendRequest(id, method, params);
  this.pendingRequests.set(idempotencyKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    this.pendingRequests.delete(idempotencyKey);
  }
}
```

### 4. Token 存储

```javascript
// 推荐: 使用环境变量或安全的存储方式
const token = process.env.OPENCLAW_GATEWAY_TOKEN;

// 备选: 使用 localStorage (开发环境)
const token = localStorage.getItem('openclaw_gateway_token');

// 不要: 硬编码在代码中
const token = 'hardcoded-token'; // ❌ 不安全
```

### 5. 错误处理

```javascript
try {
  await client.connect();
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // 提示用户重新输入 Token
    showAuthDialog();
  } else if (error.code === 'INVALID_PROTOCOL') {
    // 提示更新客户端
    showUpdateDialog();
  } else {
    // 通用错误处理
    showErrorToast(error.message);
  }
}
```

---

## 参考

- [OpenClaw 官方文档](https://docs.openclaw.ai/)
- [Gateway 协议文档](https://docs.openclaw.ai/gateway/protocol)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
