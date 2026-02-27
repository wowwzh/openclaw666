/**
 * OpenClaw Console - Gateway RPC API
 * 基于 IPC 的 Gateway 远程过程调用
 * 
 * 使用 window.electron.ipcRenderer.invoke('gateway:rpc', ...) 与后端通信
 */

import type {
  GatewayStatus,
  GatewayHealth,
  CronTask,
  ChatSession,
  Channel,
} from '../stores/types'

// ============================================
// IPC 通道定义
// ============================================

const IPC_CHANNEL = 'gateway:rpc'

// ============================================
// RPC 调用基础函数
// ============================================

/**
 * 发起 Gateway RPC 调用
 * @param method - RPC 方法名
 * @param params - 方法参数
 * @returns Promise<T> - 调用结果
 */
async function rpc<T = unknown>(method: string, params?: unknown): Promise<T> {
  if (typeof window === 'undefined' || !window.electron?.ipcRenderer) {
    throw new Error('Electron IPC is not available')
  }
  
  return window.electron.ipcRenderer.invoke(IPC_CHANNEL, { method, params })
}

// ============================================
// Gateway 状态相关
// ============================================

/**
 * 获取 Gateway 状态
 */
export async function getGatewayStatus(): Promise<GatewayStatus> {
  return rpc<GatewayStatus>('gateway.status')
}

/**
 * 启动 Gateway
 */
export async function startGateway(): Promise<{ success: boolean; error?: string }> {
  return rpc('gateway.start')
}

/**
 * 停止 Gateway
 */
export async function stopGateway(): Promise<{ success: boolean; error?: string }> {
  return rpc('gateway.stop')
}

/**
 * 重启 Gateway
 */
export async function restartGateway(): Promise<{ success: boolean; error?: string }> {
  return rpc('gateway.restart')
}

/**
 * 获取 Gateway 健康状态
 */
export async function getGatewayHealth(): Promise<GatewayHealth> {
  return rpc<GatewayHealth>('gateway.health')
}

// ============================================
// Cron 定时任务相关
// ============================================

/**
 * Cron 任务列表查询参数
 */
export interface CronListParams {
  enabled?: boolean
  status?: 'idle' | 'running' | 'error'
}

/**
 * 创建 Cron 任务参数
 */
export interface CronCreateParams {
  name: string
  description?: string
  schedule: string
  command: string
  enabled?: boolean
}

/**
 * 更新 Cron 任务参数
 */
export interface CronUpdateParams {
  id: string
  name?: string
  description?: string
  schedule?: string
  command?: string
  enabled?: boolean
}

/**
 * 删除 Cron 任务参数
 */
export interface CronDeleteParams {
  id: string
}

/**
 * 获取 Cron 任务列表
 */
export async function cronList(params?: CronListParams): Promise<CronTask[]> {
  return rpc<CronTask[]>('cron.list', params)
}

/**
 * 创建新的 Cron 任务
 */
export async function cronCreate(params: CronCreateParams): Promise<{ success: boolean; id?: string; error?: string }> {
  return rpc('cron.create', params)
}

/**
 * 更新 Cron 任务
 */
export async function cronUpdate(params: CronUpdateParams): Promise<{ success: boolean; error?: string }> {
  return rpc('cron.update', params)
}

/**
 * 删除 Cron 任务
 */
export async function cronDelete(params: CronDeleteParams): Promise<{ success: boolean; error?: string }> {
  return rpc('cron.delete', params)
}

/**
 * 手动触发 Cron 任务执行
 */
export async function cronRun(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('cron.run', params)
}

// ============================================
// Sessions 会话相关
// ============================================

/**
 * 会话列表查询参数
 */
export interface SessionListParams {
  limit?: number
  offset?: number
}

/**
 * 会话历史查询参数
 */
export interface SessionHistoryParams {
  sessionKey: string
  limit?: number
  offset?: number
}

/**
 * 获取会话列表
 */
export async function sessionsList(params?: SessionListParams): Promise<ChatSession[]> {
  return rpc<ChatSession[]>('sessions.list', params)
}

/**
 * 获取会话历史消息
 */
export async function sessionsHistory(params: SessionHistoryParams): Promise<import('../stores/types').ChatMessage[]> {
  return rpc('sessions.history', params)
}

/**
 * 创建新会话
 */
export async function sessionsCreate(params: { label?: string; thinkingLevel?: string; model?: string }): Promise<{ success: boolean; session?: ChatSession; error?: string }> {
  return rpc('sessions.create', params)
}

/**
 * 删除会话
 */
export async function sessionsDelete(params: { key: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('sessions.delete', params)
}

/**
 * 切换会话
 */
export async function sessionsSwitch(params: { key: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('sessions.switch', params)
}

// ============================================
// Channels 频道相关
// ============================================

/**
 * 获取频道列表
 */
export async function channelsList(): Promise<Channel[]> {
  return rpc<Channel[]>('channels.list')
}

/**
 * 获取频道详情
 */
export async function channelsGet(params: { id: string }): Promise<Channel> {
  return rpc<Channel>('channels.get', params)
}

/**
 * 添加频道
 */
export async function channelsAdd(params: { type: string; config: Record<string, unknown> }): Promise<{ success: boolean; channel?: Channel; error?: string }> {
  return rpc('channels.add', params)
}

/**
 * 更新频道配置
 */
export async function channelsUpdate(params: { id: string; config: Record<string, unknown> }): Promise<{ success: boolean; error?: string }> {
  return rpc('channels.update', params)
}

/**
 * 删除频道
 */
export async function channelsDelete(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('channels.delete', params)
}

/**
 * 连接频道
 */
export async function channelsConnect(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('channels.connect', params)
}

/**
 * 断开频道连接
 */
export async function channelsDisconnect(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('channels.disconnect', params)
}

// ============================================
// Skills 技能相关
// ============================================

/**
 * 获取技能列表
 */
export async function skillsList(): Promise<import('../stores/types').Skill[]> {
  return rpc<import('../stores/types').Skill[]>('skills.list')
}

/**
 * 获取技能详情
 */
export async function skillsGet(params: { id: string }): Promise<import('../stores/types').Skill> {
  return rpc<import('../stores/types').Skill>('skills.get', params)
}

/**
 * 启用技能
 */
export async function skillsEnable(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('skills.enable', params)
}

/**
 * 禁用技能
 */
export async function skillsDisable(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('skills.disable', params)
}

/**
 * 配置技能
 */
export async function skillsConfigure(params: { id: string; config: Record<string, unknown> }): Promise<{ success: boolean; error?: string }> {
  return rpc('skills.configure', params)
}

// ============================================
// Providers 提供商相关
// ============================================

/**
 * 获取提供商列表
 */
export async function providersList(): Promise<import('../stores/types').ProviderConfig[]> {
  return rpc<import('../stores/types').ProviderConfig[]>('providers.list')
}

/**
 * 添加提供商
 */
export async function providersAdd(params: Omit<import('../stores/types').ProviderConfig, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  return rpc('providers.add', params)
}

/**
 * 更新提供商
 */
export async function providersUpdate(params: import('../stores/types').ProviderConfig): Promise<{ success: boolean; error?: string }> {
  return rpc('providers.update', params)
}

/**
 * 删除提供商
 */
export async function providersDelete(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('providers.delete', params)
}

/**
 * 测试提供商连接
 */
export async function providersTest(params: { id: string }): Promise<{ success: boolean; error?: string }> {
  return rpc('providers.test', params)
}

// ============================================
// Settings 设置相关
// ============================================

/**
 * 获取设置
 */
export async function settingsGet(): Promise<import('../stores/types').Settings> {
  return rpc<import('../stores/types').Settings>('settings.get')
}

/**
 * 更新设置
 */
export async function settingsUpdate(params: Partial<import('../stores/types').Settings>): Promise<{ success: boolean; error?: string }> {
  return rpc('settings.update', params)
}

// ============================================
// 日志相关
// ============================================

/**
 * 获取日志
 */
export async function logsGet(params?: { level?: string; limit?: number }): Promise<import('../stores/types').Log[]> {
  return rpc<import('../stores/types').Log[]>('logs.get', params)
}

/**
 * 清除日志
 */
export async function logsClear(): Promise<{ success: boolean }> {
  return rpc('logs.clear')
}

// ============================================
// 默认导出
// ============================================

export default {
  // Gateway
  getGatewayStatus,
  startGateway,
  stopGateway,
  restartGateway,
  getGatewayHealth,
  
  // Cron
  cronList,
  cronCreate,
  cronUpdate,
  cronDelete,
  cronRun,
  
  // Sessions
  sessionsList,
  sessionsHistory,
  sessionsCreate,
  sessionsDelete,
  sessionsSwitch,
  
  // Channels
  channelsList,
  channelsGet,
  channelsAdd,
  channelsUpdate,
  channelsDelete,
  channelsConnect,
  channelsDisconnect,
  
  // Skills
  skillsList,
  skillsGet,
  skillsEnable,
  skillsDisable,
  skillsConfigure,
  
  // Providers
  providersList,
  providersAdd,
  providersUpdate,
  providersDelete,
  providersTest,
  
  // Settings
  settingsGet,
  settingsUpdate,
  
  // Logs
  logsGet,
  logsClear,
}
