// ============================================
// OpenClaw Console - 类型定义
// 参考 ClawX 的类型设计
// ============================================

// ============================================
// Gateway 类型定义
// ============================================

// Gateway 状态
export interface GatewayStatus {
  state: 'stopped' | 'starting' | 'running' | 'error' | 'reconnecting'
  port: number
  pid?: number
  uptime?: number
  error?: string
  connectedAt?: number
  version?: string
  reconnectAttempts?: number
}

// Gateway RPC 响应
export interface GatewayRpcResponse<T = unknown> {
  success: boolean
  result?: T
  error?: string
}

// Gateway 健康状态
export interface GatewayHealth {
  ok: boolean
  error?: string
  uptime?: number
  version?: string
}

// Gateway 通知 (服务器发起的事件)
export interface GatewayNotification {
  method: string
  params?: unknown
}

// ============================================
// Channel 类型定义 (参考 ClawX)
// ============================================

// 支持的通道类型
export type ChannelType =
  | 'whatsapp'
  | 'telegram'
  | 'discord'
  | 'signal'
  | 'feishu'
  | 'imessage'
  | 'matrix'
  | 'line'
  | 'msteams'
  | 'googlechat'
  | 'mattermost'
  | 'wechat'
  | 'slack'
  | 'webchat'

// 通道连接状态
export type ChannelStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

// 通道连接类型
export type ChannelConnectionType = 'token' | 'qr' | 'oauth' | 'webhook'

// 通道数据结构和旧的别名
export interface Channel {
  id: string
  type: ChannelType
  name: string
  status: ChannelStatus
  accountId?: string
  lastActivity?: string
  error?: string
  avatar?: string
  metadata?: Record<string, unknown>
  config?: Record<string, unknown> // 兼容旧字段
}

// 通道配置字段定义
export interface ChannelConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select'
  placeholder?: string
  required?: boolean
  envVar?: string
  description?: string
  options?: { value: string; label: string }[]
}

// 通道元数据
export interface ChannelMeta {
  id: ChannelType
  name: string
  icon: string
  description: string
  connectionType: ChannelConnectionType
  docsUrl: string
  configFields: ChannelConfigField[]
  instructions: string[]
  isPlugin?: boolean
}

// 通道图标映射
export const CHANNEL_ICONS: Record<ChannelType, string> = {
  whatsapp: '📱',
  telegram: '✈️',
  discord: '🎮',
  signal: '🔒',
  feishu: '🐦',
  imessage: '💬',
  matrix: '🔗',
  line: '🟢',
  msteams: '👔',
  googlechat: '💭',
  mattermost: '💠',
  wechat: '💚',
  slack: '💬',
  webchat: '🌐',
}

// 通道显示名称映射
export const CHANNEL_NAMES: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  discord: 'Discord',
  signal: 'Signal',
  feishu: 'Feishu / Lark',
  imessage: 'iMessage',
  matrix: 'Matrix',
  line: 'LINE',
  msteams: 'Microsoft Teams',
  googlechat: 'Google Chat',
  mattermost: 'Mattermost',
  wechat: 'WeChat',
  slack: 'Slack',
  webchat: 'Web Chat',
}

// 技能
export interface Skill {
  id: string
  name: string
  description: string
  enabled: boolean
  category?: string
  icon?: string
  configurable?: boolean
  version?: string
  author?: string
  // 本地扩展
  level?: number
  source?: 'local' | 'market'
  stars?: number
}

// 定时任务
export interface CronTask {
  id: string
  name: string
  description?: string
  schedule: string
  command: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  status: 'idle' | 'running' | 'error'
  error?: string
}

// 技能包（市场）
export interface SkillBundle {
  id: string
  name: string
  description: string
  skills: string[]
  icon?: string
  recommended?: boolean
}

// 工具调用
export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: unknown
  status: 'pending' | 'running' | 'completed' | 'error'
  duration?: number
}

// 消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'toolresult'
  content: unknown // string | ContentBlock[]
  timestamp?: number
  toolCallId?: string
  toolName?: string
  isError?: boolean
}

// 会话
export interface ChatSession {
  key: string
  label?: string
  displayName?: string
  thinkingLevel?: string
  model?: string
}

// 工具调用状态
export interface ToolStatus {
  id?: string
  toolCallId?: string
  name: string
  status: 'running' | 'completed' | 'error'
  durationMs?: number
  summary?: string
  updatedAt: number
}

// 供应商配置
export interface ProviderConfig {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'ollama' | 'minimax' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
  enabled: boolean
}

// 设置
export interface Settings {
  // Agent配置
  model: string
  thinking: string
  agentName?: string
  agentPersonality?: string
  greeting?: string

  // Gateway配置
  gatewayHost: string
  gatewayPort: number
  gatewayToken: string
  gatewayAutoStart: boolean
  gatewayAutoConnect: boolean

  // API配置
  apiKeys: { minimax: string; tavily: string }

  // 通道配置
  channels: { feishu: boolean; telegram: boolean; discord: boolean }

  // UI配置
  theme: 'light' | 'dark'
  startMinimized: boolean
  launchAtStartup: boolean

  // 通知配置
  notifications: {
    taskComplete: boolean
    learningReport: boolean
    errorAlert: boolean
    evomapUpdate: boolean
  }
}

// 通知
export interface Notification {
  id: string
  type: 'message' | 'task' | 'evomap' | 'system'
  title: string
  content: string
  timestamp: number
  read: boolean
  link?: string
}

// 日志
export interface Log {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  time: string
}

// UI 状态
export interface UIState {
  sidebarCollapsed: boolean
  currentPage: string
  isLoading: {
    gatewayStatus: boolean
    tasks: boolean
    chat: boolean
  }
  error: {
    gatewayStatus: string | null
    tasks: string | null
  }
}
