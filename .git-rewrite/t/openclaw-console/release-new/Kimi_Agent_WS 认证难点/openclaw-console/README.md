# OpenClaw Console Web 客户端

一个基于 React + TypeScript 的 OpenClaw Gateway WebSocket API 管理界面。

## 功能特性

- ✅ **完整的 WebSocket 认证流程** - 支持 challenge-response + token 认证
- ✅ **自动重连机制** - 指数退避 + 抖动，防止重连风暴
- ✅ **心跳检测** - 自动检测连接健康状态
- ✅ **类型安全的 RPC 调用** - TypeScript 完整类型支持
- ✅ **实时仪表盘** - 展示 Gateway 状态、频道、Cron 任务等
- ✅ **响应式 UI** - 现代化的用户界面

## 快速开始

### 1. 安装依赖

```bash
cd openclaw-console
npm install
```

### 2. 配置环境变量

```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，设置 Gateway 地址和 Token
REACT_APP_GATEWAY_URL=ws://127.0.0.1:18789
REACT_APP_GATEWAY_TOKEN=your-token-here
```

### 3. 启动开发服务器

```bash
npm start
```

访问 http://localhost:3000 查看应用。

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
openclaw-console/
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── types/
│   │   └── gateway.ts      # Gateway API 类型定义
│   ├── lib/
│   │   └── gateway-client.ts  # WebSocket 客户端核心
│   ├── hooks/
│   │   └── useGateway.ts   # React Hooks
│   ├── components/
│   │   ├── GatewayConfigForm.tsx   # 连接配置表单
│   │   ├── GatewayConnectionStatus.tsx  # 连接状态组件
│   │   └── GatewayDashboard.tsx    # 仪表盘组件
│   ├── App.tsx             # 主应用组件
│   └── index.tsx           # 入口文件
├── API_DOCUMENTATION.md    # API 文档
├── package.json
├── tsconfig.json
└── README.md
```

## 使用示例

### 基础用法

```tsx
import { useGateway, useGatewayStatus } from './hooks/useGateway';

function MyComponent() {
  const { isConnected, connect, disconnect } = useGateway({
    autoConnect: true,
  });
  
  const { data: status, isLoading, error } = useGatewayStatus(30000);
  
  if (!isConnected) {
    return <button onClick={connect}>连接 Gateway</button>;
  }
  
  return (
    <div>
      <p>Gateway 状态: {status?.runtime}</p>
      <button onClick={disconnect}>断开连接</button>
    </div>
  );
}
```

### 自定义 RPC 调用

```tsx
import { useGateway } from './hooks/useGateway';

function MyComponent() {
  const { call } = useGateway();
  
  const handleClick = async () => {
    try {
      const result = await call('channels.list', {});
      console.log('Channels:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return <button onClick={handleClick}>获取频道列表</button>;
}
```

### 事件订阅

```tsx
import { useGatewayEvent } from './hooks/useGateway';

function MyComponent() {
  useGatewayEvent('tick', (payload) => {
    console.log('Heartbeat:', payload.timestamp);
  });
  
  useGatewayEvent('agent', (payload) => {
    console.log('Agent update:', payload);
  });
  
  return <div>监听事件中...</div>;
}
```

## 配置选项

```typescript
interface GatewayClientConfig {
  url: string;                    // Gateway WebSocket URL
  authToken: string;              // 认证 Token
  clientId?: string;              // 客户端 ID (默认: 'openclaw-console')
  clientVersion?: string;         // 客户端版本 (默认: '1.0.0')
  protocolVersion?: number;       // 协议版本 (默认: 3)
  role?: 'operator' | 'node';     // 角色 (默认: 'operator')
  scopes?: string[];              // 权限范围
  reconnect?: {
    enabled: boolean;             // 启用重连 (默认: true)
    initialDelay: number;         // 初始延迟 ms (默认: 1000)
    maxDelay: number;             // 最大延迟 ms (默认: 30000)
    maxRetries: number;           // 最大重试次数 (默认: 10)
    jitter: number;               // 抖动系数 (默认: 0.1)
  };
  heartbeat?: {
    enabled: boolean;             // 启用心跳 (默认: true)
    interval: number;             // 心跳间隔 ms (默认: 15000)
    timeout: number;              // 超时时间 ms (默认: 10000)
  };
}
```

## 认证机制

### 1. Token 认证

从环境变量或配置文件获取 Token:

```bash
# 环境变量
export OPENCLAW_GATEWAY_TOKEN=your-token-here

# 或从 Gateway 配置文件获取
# ~/.openclaw/openclaw.json -> gateway.auth.token
```

### 2. Challenge-Response 流程

```
Client -> Gateway: WebSocket 连接
Gateway -> Client: connect.challenge { nonce, ts }
Client -> Gateway: connect { auth.token, device }
Gateway -> Client: hello-ok { protocol, policy, auth.deviceToken }
```

### 3. 设备 Token

首次配对成功后，Gateway 会颁发 `deviceToken`，后续连接可使用 deviceToken 代替主 Token。

```typescript
// 自动保存和加载 deviceToken
localStorage.setItem('openclaw_device_token', deviceToken);
const deviceToken = localStorage.getItem('openclaw_device_token');
```

## 重连机制

### 指数退避算法

```
延迟 = min(initialDelay * 2^attempt, maxDelay) + random(-jitter, +jitter)

示例 (initialDelay=1000, maxDelay=30000, jitter=0.1):
第 1 次: ~1000ms
第 2 次: ~2000ms
第 3 次: ~4000ms
第 4 次: ~8000ms
第 5 次: ~16000ms
第 6+ 次: ~30000ms (封顶)
```

### 重连触发条件

- 连接意外断开 (非主动调用 `disconnect()`)
- 心跳超时
- 网络错误

## API 文档

详见 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 常见问题

### Q: 连接失败，提示 "Invalid authentication token"

A: 检查 Token 是否正确设置:
```bash
# 查看 Gateway Token
openclaw config get gateway.auth.token

# 或环境变量
echo $OPENCLAW_GATEWAY_TOKEN
```

### Q: 连接失败，提示 "Protocol version mismatch"

A: 确保 `protocolVersion` 设置为 3，与 Gateway 版本匹配。

### Q: WebSocket 连接被拒绝

A: 检查 Gateway 是否正在运行:
```bash
openclaw gateway status
openclaw gateway probe
```

### Q: 跨域错误

A: 确保 Gateway 配置允许你的域名:
```json
{
  "gateway": {
    "bind": "lan",
    "cors": {
      "origins": ["http://localhost:3000"]
    }
  }
}
```

## 安全建议

1. **不要在代码中硬编码 Token** - 使用环境变量或配置文件
2. **使用 HTTPS/WSS** - 生产环境必须使用 WSS
3. **限制权限范围** - 只申请必要的 `scopes`
4. **定期轮换 Token** - 使用 `device.token.rotate` 方法
5. **启用设备配对** - 远程连接必须签名 challenge

## 参考

- [OpenClaw 官方文档](https://docs.openclaw.ai/)
- [Gateway 协议文档](https://docs.openclaw.ai/gateway/protocol)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)

## License

MIT
