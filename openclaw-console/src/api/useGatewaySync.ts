// ============================================
// Gateway 同步 Hook - 自动同步状态到 Stores
// 参考 ClawX 的完整实现
// ============================================

import { useEffect, useCallback } from 'react'
import { gateway, on, connect } from './gateway-ws'
import { 
  useGatewayStore, 
  useChatStore, 
  useUIStore, 
  useTasksStore,
  useChannelsStore,
  useSettingsStore 
} from '../stores'

export function useGatewaySync() {
  const gatewayStore = useGatewayStore()
  const chatStore = useChatStore()
  const uiStore = useUIStore()
  const tasksStore = useTasksStore()
  const channelsStore = useChannelsStore()
  const settingsStore = useSettingsStore()

  // 同步所有数据
  const syncAll = useCallback(async () => {
    if (!gateway.isConnected()) return

    try {
      // 并行获取所有数据
      const [status, health, channels, sessions, cron] = await Promise.all([
        gateway.getStatus(),
        gateway.getHealth(),
        gateway.listChannels(),
        gateway.listSessions(),
        gateway.listCron(),
      ])

      // 更新 Gateway 状态
      gatewayStore.setStatus(status as any)
      gatewayStore.setHealth(health)

      // 更新通道状态
      if (channels) {
        channelsStore.setChannels(channels)
      }

      // 更新会话列表
      if (sessions) {
        chatStore.setSessions(sessions)
      }

      // 更新定时任务
      if (cron) {
        tasksStore.setTasks(cron)
      }
    } catch (e) {
      console.error('[GatewaySync] Sync failed:', e)
    }
  }, [])

  // 初始化连接并订阅事件
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        await connect()
        if (!mounted) return

        // 获取初始状态
        const status = await gateway.getStatus()
        gatewayStore.setStatus(status as any)
        gatewayStore.setInitialized(true)

        // 同步所有数据
        await syncAll()
      } catch (e) {
        console.error('[GatewaySync] Init failed:', e)
        gatewayStore.setError((e as Error).message)
      }
    }

    init()

    // 订阅事件
    const unsubscribers = [
      // 连接状态
      on('connected', () => {
        console.log('[GatewaySync] Connected')
        gatewayStore.setStatus({ state: 'running', port: 18789 } as any)
        syncAll()
      }),

      on('disconnected', (code: number) => {
        console.log('[GatewaySync] Disconnected:', code)
        gatewayStore.setStatus({ state: 'stopped', port: 18789 } as any)
      }),

      on('reconnecting', (attempt: number) => {
        console.log('[GatewaySync] Reconnecting:', attempt)
        gatewayStore.setStatus({ state: 'reconnecting', port: 18789 } as any)
      }),

      // 健康状态更新
      on('health', (health) => {
        gatewayStore.setHealth(health)
      }),

      // 聊天消息
      on('chat-message', (data) => {
        chatStore.addMessage({
          id: data.id || Date.now().toString(),
          role: 'assistant',
          content: data.message?.content || '',
          timestamp: data.timestamp || Date.now(),
        })
      }),

      // 通道状态变化
      on('channel-status', (data) => {
        channelsStore.updateChannel(data.channelId, {
          status: data.status,
          lastActivity: data.lastActivity,
          error: data.error,
        })
        
        // 发送通知
        uiStore.addNotification({
          type: 'system',
          title: '通道状态变化',
          content: `${data.channelId}: ${data.status}`,
        })
      }),

      // 任务状态变化
      on('task-status', (data) => {
        tasksStore.updateTask(data.taskId, {
          status: data.status,
          lastRun: data.lastRun,
          error: data.error,
        })
      }),

      // 设置变更
      on('settings-changed', (data) => {
        settingsStore.updateSettings(data)
      }),
    ]

    return () => {
      mounted = false
      unsubscribers.forEach(unsub => unsub())
    }
  }, [])

  return {
    sync: syncAll,
    isConnected: gateway.isConnected(),
  }
}

// 便捷 Hook：检查 Gateway 是否在线
export function useGatewayOnline() {
  const status = useGatewayStore((s) => s.status)
  return status.state === 'running'
}

// 便捷 Hook：获取 Gateway 版本
export function useGatewayVersion() {
  return useGatewayStore((s) => s.status.version)
}

// 便捷 Hook：获取运行时间
export function useGatewayUptime() {
  const uptime = useGatewayStore((s) => s.status.uptime)
  if (!uptime) return '0秒'
  
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  
  if (hours > 0) return `${hours}小时${minutes}分钟`
  if (minutes > 0) return `${minutes}分钟${seconds}秒`
  return `${seconds}秒`
}
