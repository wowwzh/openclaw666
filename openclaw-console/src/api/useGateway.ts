// ============================================
// Gateway Hook - React 集成
// 参考 ClawX 的 useGatewayStore
// ============================================

import { useEffect, useCallback } from 'react'
import { gateway, on, connect } from './gateway-ws'
import { useGatewayStore, useChatStore, useUIStore, useTasksStore } from '../stores'

export function useGateway() {
  const { setStatus, setHealth, setInitialized, setError } = useGatewayStore()
  const { addMessage, setSending } = useChatStore()
  const { addNotification } = useUIStore()
  const { updateTask } = useTasksStore()

  // 初始化连接
  const init = useCallback(async () => {
    try {
      setInitialized(true)
      await connect()
      
      // 获取初始状态
      const status = await gateway.getStatus()
      setStatus(status as any)
      
      const health = await gateway.getHealth()
      setHealth(health)
    } catch (e) {
      console.error('[useGateway] Init failed:', e)
      setError((e as Error).message)
    }
  }, [])

  // 订阅事件
  useEffect(() => {
    // 连接事件
    const unsubConnected = on('connected', () => {
      console.log('[useGateway] Connected!')
      setStatus({ state: 'running', port: 18789 } as any)
    })

    // 断开连接
    const unsubDisconnected = on('disconnected', (code, reason) => {
      console.log('[useGateway] Disconnected:', code, reason)
      setStatus({ state: 'stopped', port: 18789 } as any)
    })

    // 重连中
    const unsubReconnecting = on('reconnecting', (attempt, delay) => {
      console.log('[useGateway] Reconnecting:', attempt, delay)
      setStatus({ state: 'reconnecting', port: 18789 } as any)
    })

    // 健康状态
    const unsubHealth = on('health', (health) => {
      setHealth(health)
    })

    // 聊天消息
    const unsubChatMessage = on('chat-message', (data) => {
      addMessage({
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.message?.content || '',
        timestamp: data.timestamp || Date.now(),
      })
    })

    // 通道状态变化
    const unsubChannelStatus = on('channel-status', (data) => {
      addNotification({
        type: 'system',
        title: '通道状态变化',
        content: `${data.channelId}: ${data.status}`,
      })
    })

    // 任务状态变化
    const unsubTaskStatus = on('task-status', (data) => {
      updateTask(data.taskId, {
        status: data.status,
        lastRun: new Date().toLocaleString('zh-CN'),
      })
    })

    return () => {
      unsubConnected()
      unsubDisconnected()
      unsubReconnecting()
      unsubHealth()
      unsubChatMessage()
      unsubChannelStatus()
      unsubTaskStatus()
    }
  }, [])

  // 自动连接（组件挂载时）
  useEffect(() => {
    init()
  }, [init])

  return {
    gateway,
    isConnected: gateway.isConnected(),
  }
}

// 便捷Hook：发送消息
export function useSendMessage() {
  const { setSending, addMessage, clearStreaming, appendStreamingText } = useChatStore()

  const send = useCallback(async (text: string, sessionKey = 'main') => {
    // 添加用户消息
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })

    setSending(true)
    clearStreaming()

    try {
      // 发送消息（流式）
      const response = await gateway.sendMessage(sessionKey, text)
      
      // 添加助手回复
      addMessage({
        id: response.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message?.content || '',
        timestamp: Date.now(),
      })
    } catch (e) {
      // 错误处理
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `发送失败: ${(e as Error).message}`,
        timestamp: Date.now(),
        isError: true,
      })
    } finally {
      setSending(false)
    }
  }, [])

  return send
}

// 便捷Hook：加载历史
export function useLoadHistory() {
  const { setMessages, setLoading } = useChatStore()

  const load = useCallback(async (sessionKey = 'main', limit = 50) => {
    setLoading(true)
    try {
      const history = await gateway.getHistory(sessionKey, limit)
      const messages = history.map((m: any, i: number) => ({
        id: m.id || String(i),
        role: m.role || 'user',
        content: m.content || m.message?.content || '',
        timestamp: m.timestamp || Date.now(),
      }))
      setMessages(messages)
    } catch (e) {
      console.error('[useLoadHistory] Failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  return load
}
