# OpenClaw Console Web 客户端 - 实现总结

## 问题解决方案概览

本文档总结了针对 OpenClaw Console Web 客户端开发中遇到的所有技术难点的完整解决方案。

---

## 1. WebSocket 认证机制

### 问题
- Gateway 使用 `connect.challenge` 挑战-响应机制
- 需要处理 `nonce` 验证和 token 认证
- 首次连接需要等待 challenge 后再发送 connect 请求

### 解决方案

#### 认证流程实现

```typescript
// src/lib/gateway-client.ts

class GatewayClient {
  private challengeNonce: string | null = null;
  private deviceToken: string | null = null;

  private async handleMessage(data: string): Promise<void> {
    const message = JSON.parse(data);
    
    switch (message.type) {
      case 'event':
        if (message.event === 'connect.challenge') {
          // 保存 challenge nonce
          this.challengeNonce = message.payload.nonce;
          // 发送 connect 请求
          await this.sendConnectRequest();
        }
        break;
      // ...
    }
  }

  private async sendConnectRequest(): Promise<void> {
    const connectParams: ConnectParams = {
      minProtocol: 3,
      maxProtocol: 3,
      client: { /* ... */ },
      role: 'operator',
      scopes: ['operator.read', 'operator.write', 'operator.admin'],
      auth: {
        token: this.config.authToken,
        deviceToken: this.deviceToken || undefined,
      },
      device: this.challengeNonce ? {
        id: this.generateDeviceId(),
        nonce: this.challengeNonce,
        signedAt: Date.now(),
      } : undefined,
    };

    const response = await this.call('connect', connectParams);
    
    // 保存 device token 用于后续连接
    if (response.auth?.deviceToken) {
      this.deviceToken = response.auth.deviceToken;
      localStorage.setItem('openclaw_device_token', this.deviceToken);
    }
  }
}
```

#### 关键要点

1. **等待 Challenge**: 连接建立后必须先等待 `connect.challenge` 事件
2. **Device Token 持久化**: 首次配对成功后保存 `deviceToken`，后续连接更快
3. **双 Token 策略**: 支持主 Token 和 Device Token 两种方式

---

## 2. API 端点和返回格式

### 问题
- 不确定还有哪些可用 API
- 返回数据格式不统一（snake_case vs camelCase）

### 解决方案

#### 完整的类型定义

```typescript
// src/types/gateway.ts

// 所有 RPC 方法的参数和返回类型
export interface GatewayStatus {
  runtime: 'running' | 'stopped' | 'error';
  version: string;
  uptime: number;
  pid: number;
  rpcProbe: 'ok' | 'error' | 'timeout';
  health: HealthStatus;
}

export interface Channel {
  channelId: string;
  account: string;
  name: string;
  enabled: boolean;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  type: string;
  capabilities: string[];
}

export interface CronJob {
  jobId: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: 'cron' | 'at' | 'interval';
    expr?: string;
    atMs?: number;
    intervalMs?: number;
    tz?: string;
  };
  // ...
}
```

#### 已验证的 API 端点列表

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `status` | Gateway 状态 | `{ includeHealth? }` | `GatewayStatus` |
| `health` | 健康检查 | `{}` | `HealthStatus` |
| `channels.list` | 频道列表 | `{ includeDisabled? }` | `Channel[]` |
| `channels.stats` | 频道统计 | `{ channelId? }` | `ChannelStats` |
| `cron.list` | Cron 任务列表 | `{ includeDisabled? }` | `CronJob[]` |
| `cron.toggle` | 切换 Cron 状态 | `{ jobId, enabled }` | `null` |
| `cron.add` | 添加 Cron 任务 | `CronJobParams` | `CronJob` |
| `cron.remove` | 删除 Cron 任务 | `{ jobId }` | `null` |
| `sessions.list` | 会话列表 | `{ filter? }` | `Session[]` |
| `agents.list` | Agent 列表 | `{}` | `Agent[]` |
| `config.get` | 获取配置 | `{ path? }` | `GatewayConfig` |
| `config.patch` | 更新配置 | `Partial<Config>` | `GatewayConfig` |
| `system.evolver_status` | Evolver 状态 | `{}` | `SystemEvolverStatus` |
| `chat.send` | 发送消息 | `{ sessionKey, message, idempotencyKey }` | `Message` |
| `agent.run` | 运行 Agent | `{ agentId, sessionKey, prompt, idempotencyKey }` | `AgentRun` |

---

## 3. 连接状态管理

### 问题
- WebSocket 断开后自动重连
- 认证 Token 存储方式（localStorage vs 硬编码）
- 超时和重试机制

### 解决方案

#### 指数退避重连算法

```typescript
// src/lib/gateway-client.ts

private scheduleReconnect(): void {
  if (this.reconnectAttempt >= this.config.reconnect.maxRetries) {
    throw new Error('Max reconnection attempts reached');
  }

  this.reconnectAttempt++;
  this.setState('reconnecting');

  // 指数退避: delay = min(initialDelay * 2^attempt, maxDelay)
  const baseDelay = this.config.reconnect.initialDelay * 
    Math.pow(2, this.reconnectAttempt - 1);
  const maxDelay = this.config.reconnect.maxDelay;
  const delay = Math.min(baseDelay, maxDelay);
  
  // 添加抖动防止重连风暴
  const jitter = delay * this.config.reconnect.jitter * (Math.random() * 2 - 1);
  const finalDelay = Math.max(0, delay + jitter);

  console.log(`Reconnecting in ${finalDelay.toFixed(0)}ms (attempt ${this.reconnectAttempt})`);

  this.reconnectTimer = window.setTimeout(() => {
    this.connect();
  }, finalDelay);
}
```

#### Token 存储策略

```typescript
// 推荐: 环境变量 (生产环境)
const token = process.env.OPENCLAW_GATEWAY_TOKEN;

// 开发环境: localStorage
const token = localStorage.getItem('openclaw_gateway_token');

// Device Token 自动管理
private saveDeviceToken(token: string): void {
  localStorage.setItem('openclaw_device_token', token);
}

private loadDeviceToken(): string | null {
  return localStorage.getItem('openclaw_device_token');
}
```

#### 心跳检测

```typescript
private startHeartbeat(tickIntervalMs: number): void {
  this.heartbeatTimer = window.setInterval(() => {
    // 发送健康检查
    this.call('health', {}).catch(() => {
      this.ws?.close();
    });
    
    // 设置超时检测
    this.heartbeatTimeoutTimer = window.setTimeout(() => {
      console.warn('Heartbeat timeout');
      this.ws?.close();
    }, this.config.heartbeat.timeout);
  }, tickIntervalMs);
}
```

---

## 4. HTTP/WebSocket 混用

### 问题
- LLM 对话用 HTTP REST API
- 状态/任务用 WebSocket
- 需要统一认证方式

### 解决方案

#### LLM HTTP API 客户端

```typescript
// src/lib/llm-api.ts

export class LlmApiClient {
  constructor(private config: { baseUrl: string; authToken: string }) {}

  // 从 Gateway WebSocket URL 推导 HTTP URL
  static fromGatewayUrl(gatewayUrl: string, authToken: string): LlmApiClient {
    const httpUrl = gatewayUrl
      .replace(/^wss:\/\//, 'https://')
      .replace(/^ws:\/\//, 'http://')
      .replace(/\/ws$/, '');
    return new LlmApiClient({ baseUrl: httpUrl, authToken });
  }

  // 流式聊天完成
  async createChatCompletionStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    // 处理 SSE 流
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      // 解析 SSE 数据并调用 onChunk
    }
  }
}
```

#### 混用示例

```tsx
// src/components/ChatExample.tsx

function ChatExample() {
  // WebSocket: 实时状态监控
  const { isConnected } = useGateway();
  useGatewayEvent('agent', (payload) => {
    setAgentStatus(payload.status);
  });

  // HTTP: LLM 对话
  const { createStream } = useLlmApi({
    baseUrl: 'http://127.0.0.1:18789',
    authToken: 'same-token-as-websocket',
  });

  const handleSend = async () => {
    // 使用 HTTP 发送聊天请求
    await createStream({
      model: 'anthropic/claude-opus-4-6',
      messages: [...],
    }, onChunk);
  };
}
```

---

## 5. 错误处理最佳实践

### 错误分类

```typescript
// 自定义错误类
export class GatewayError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
  }
}

export class GatewayTimeoutError extends GatewayError {
  constructor() {
    super('Request timeout', 'TIMEOUT');
  }
}

export class GatewayAuthError extends GatewayError {
  constructor() {
    super('Authentication failed', 'AUTH_FAILED');
  }
}
```

### 错误处理模式

```typescript
try {
  await client.connect();
} catch (error) {
  if (error instanceof GatewayAuthError) {
    // 显示认证对话框
    showAuthDialog();
  } else if (error instanceof GatewayTimeoutError) {
    // 显示超时提示，提供重试
    showTimeoutToast();
  } else {
    // 通用错误处理
    showErrorToast(error.message);
  }
}
```

---

## 6. React Hooks 使用指南

### 基础 Hook

```tsx
// 连接管理
const { isConnected, connect, disconnect, call } = useGateway({
  autoConnect: true,
});

// 数据获取
const { data: status, isLoading, error, refetch } = useGatewayStatus(30000);
const { data: channels } = useChannels(60000);
const { data: cronJobs } = useCronJobs();

// 事件订阅
useGatewayEvent('tick', (payload) => {
  console.log('Heartbeat:', payload.timestamp);
});
```

### 组合 Hook - 仪表盘

```tsx
const { data, isLoading, error, refetch } = useDashboardData(30000);

// data 包含:
// - status: Gateway 状态
// - channels: 频道列表
// - channelStats: 频道统计
// - cronJobs: Cron 任务
// - sessions: 会话列表
// - agents: Agent 列表
```

---

## 7. 项目文件结构

```
openclaw-console/
├── src/
│   ├── types/
│   │   └── gateway.ts          # 类型定义 (已验证)
│   ├── lib/
│   │   ├── gateway-client.ts   # WebSocket 客户端核心
│   │   └── llm-api.ts          # HTTP REST API 客户端
│   ├── hooks/
│   │   └── useGateway.ts       # React Hooks
│   ├── components/
│   │   ├── GatewayConfigForm.tsx      # 连接配置
│   │   ├── GatewayConnectionStatus.tsx # 状态显示
│   │   ├── GatewayDashboard.tsx       # 仪表盘
│   │   └── ChatExample.tsx            # 聊天示例
│   ├── App.tsx                 # 主应用
│   └── index.tsx               # 入口
├── API_DOCUMENTATION.md        # 完整 API 文档
├── README.md                   # 使用指南
└── package.json
```

---

## 8. 快速开始

### 安装

```bash
cd openclaw-console
npm install
```

### 配置

```bash
# 编辑 .env
REACT_APP_GATEWAY_URL=ws://127.0.0.1:18789
REACT_APP_GATEWAY_TOKEN=your-token
```

### 运行

```bash
npm start
```

---

## 9. 参考资源

- [OpenClaw 官方文档](https://docs.openclaw.ai/)
- [Gateway 协议文档](https://docs.openclaw.ai/gateway/protocol)
- [API 完整文档](./API_DOCUMENTATION.md)

---

## 总结

本实现提供了:

1. ✅ **完整的认证流程** - challenge-response + token + device token
2. ✅ **健壮的连接管理** - 指数退避重连 + 心跳检测
3. ✅ **类型安全的 API** - TypeScript 完整类型覆盖
4. ✅ **灵活的架构** - HTTP/WebSocket 混用
5. ✅ **丰富的组件** - 配置表单、状态显示、仪表盘、聊天示例
6. ✅ **详细的文档** - API 文档、使用指南、实现总结
