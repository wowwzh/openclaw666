# OpenClaw Console - API 使用指南

## 快速开始

```typescript
import { useGatewaySync, useChannels, useTasks } from './api'
import { startGateway, stopGateway, restartGateway } from './api'
import { connectChannel, disconnectChannel, toggleChannel } from './api'
import { notifySuccess, notifyError, notifyTask } from './api'
import { requestNotificationPermission } from './api'
```

## 功能模块

### 1. Gateway 连接

```typescript
// 自动连接并同步（推荐）
import { useGatewaySync, useGatewayOnline, useGatewayVersion } from './api'

function App() {
  useGatewaySync() // 自动连接，同步状态
  
  const isOnline = useGatewayOnline()
  const version = useGatewayVersion()
  
  return <div>{isOnline ? `在线 v${version}` : '离线'}</div>
}

// 手动控制
import { startGateway, stopGateway, restartGateway } from './api'

await startGateway()   // 启动
await stopGateway()    // 停止
await restartGateway() // 重启
```

### 2. 通道管理

```typescript
import { getChannels, connectChannel, disconnectChannel } from './api'

// 获取所有通道
const channels = getChannels()

// 连接/断开通道
await connectChannel('telegram')
await disconnectChannel('feishu')

// 切换状态
import { toggleChannel } from './api'
await toggleChannel('discord')
```

### 3. 发送消息

```typescript
import { useSendMessage } from './api'

function Chat() {
  const sendMessage = useSendMessage()
  
  const handleSend = async (text) => {
    await sendMessage(text)
  }
}
```

### 4. 桌面通知

```typescript
import { notifySuccess, notifyError, notifyTask, requestNotificationPermission } from './api'

// 请求权限（在用户交互中）
await requestNotificationPermission()

// 发送通知
await notifySuccess('任务完成', 'EvoMap 检查完成')
await notifyError('连接失败', '无法连接到 Gateway')
await notifyTask('技能练习', 'success', '完成 3 道算法题')
```

### 5. 实时事件

```typescript
import { on } from './api'

// 订阅事件
const unsubMessage = on('chat-message', (data) => {
  console.log('新消息:', data)
})

const unsubChannel = on('channel-status', (data) => {
  console.log('通道状态变化:', data)
})

const unsubTask = on('task-status', (data) => {
  console.log('任务状态变化:', data)
})

// 取消订阅
unsubMessage()
```

### 6. 使用 Stores

```typescript
import { 
  useGatewayStore, 
  useTasks, 
  useSkills, 
  useChannels, 
  useSettings, 
  useNotifications 
} from './stores'

function Dashboard() {
  const status = useGatewayStore((s) => s.status)
  const tasks = useTasks()
  const skills = useSkills()
  const notifications = useNotifications()
  
  return (
    <div>
      <h1>Gateway: {status.state}</h1>
      <p>任务: {tasks.length}</p>
      <p>技能: {skills.length}</p>
      <p>通知: {notifications.length}</p>
    </div>
  )
}
```

## Store 列表

| Store | 用途 | 持久化 |
|-------|------|--------|
| `useGatewayStore` | Gateway 状态 | ❌ |
| `useTasksStore` | 定时任务 | ✅ |
| `useSkillsStore` | 技能列表 | ✅ |
| `useChatStore` | 会话消息 | ❌ |
| `useSettingsStore` | 设置 | ✅ |
| `useUIStore` | UI状态 | 部分 |
| `useChannelsStore` | 通道 | ❌ |
| `useProvidersStore` | 供应商 | ✅ |

## 事件列表

| 事件 | 参数 | 说明 |
|------|------|------|
| `connected` | - | Gateway 已连接 |
| `disconnected` | code, reason | Gateway 断开 |
| `reconnecting` | attempt, delay | 正在重连 |
| `health` | health | 健康状态 |
| `chat-message` | data | 新消息 |
| `channel-status` | data | 通道状态 |
| `task-status` | data | 任务状态 |
