// ============================================
// Gateway WebSocket 客户端（参考 ClawX 实现）
// 支持 ECDSA 设备认证 + JSON-RPC 2.0 + 自动重连
// ============================================

import { GatewayStatus, GatewayHealth, Channel, ChatMessage } from '../stores/types'

// 配置
const GATEWAY_WS_URL = 'ws://localhost:18789/ws'
const GATEWAY_HTTP_URL = 'http://localhost:18789'

// 存储键
const DEVICE_TOKEN_KEY = 'OPENCLAW_GATEWAY_DEVICE_TOKEN'
const DEVICE_PUBLIC_KEY_KEY = 'OPENCLAW_DEVICE_PUBLIC_KEY'
const DEVICE_ID_KEY = 'OPENCLAW_DEVICE_ID'

// 预注册的设备信息（来自 paired.json）
const PREGEN_DEVICE_ID = '623d5e337de8b1972d3a8e1643c0a2f2b4593bccf3bb13793fbcf3cb256441af'
const PREGEN_PUBLIC_KEY = 'XSE2Xt5IxhT2Sak1flnXZLnlcqIOkdEIBrid-_aQINk'

// 状态
let ws: WebSocket | null = null
let deviceToken = 'bc9fdceecace2b226836f8f35d884f9365093aa390021263'
let deviceId = PREGEN_DEVICE_ID
let keyPair: CryptoKeyPair | null = null
let isAuthenticated = false
let connectNonce: string | null = null

// 重连配置
const RECONNECT_CONFIG = {
  maxAttempts: 10,
  baseDelay: 1000,
  maxDelay: 30000,
}
let reconnectAttempts = 0

// 待处理的请求
const pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>()
let messageId = 0

// 事件监听器
type EventCallback = (...args: any[]) => void
const eventListeners: Map<string, Set<EventCallback>> = new Map()

// ===== 密钥管理 =====

async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  )
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

async function signData(data: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    dataBuffer
  )
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

async function initializeKeys(): Promise<void> {
  try {
    const savedPublicKey = localStorage.getItem(DEVICE_PUBLIC_KEY_KEY)
    const savedDeviceId = localStorage.getItem(DEVICE_ID_KEY)

    if (savedPublicKey && savedDeviceId) {
      console.log('[Gateway] Loading existing credentials')
      keyPair = await generateKeyPair()
      deviceId = savedDeviceId
    } else {
      console.log('[Gateway] Using pre-registered credentials')
      keyPair = await generateKeyPair()
      deviceId = PREGEN_DEVICE_ID
    }
  } catch (e) {
    console.error('[Gateway] Failed to initialize keys:', e)
  }
}

function loadDeviceToken(): void {
  const saved = localStorage.getItem(DEVICE_TOKEN_KEY)
  if (saved) deviceToken = saved
}

function saveDeviceToken(token: string): void {
  deviceToken = token
  localStorage.setItem(DEVICE_TOKEN_KEY, token)
}

// ===== 事件系统 =====

export function on(event: string, callback: EventCallback): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set())
  }
  eventListeners.get(event)!.add(callback)
  
  // 返回取消订阅函数
  return () => {
    eventListeners.get(event)?.delete(callback)
  }
}

function emit(event: string, ...args: any[]): void {
  eventListeners.get(event)?.forEach(cb => cb(...args))
}

// ===== WebSocket 连接 =====

export function connect(): Promise<WebSocket> {
  return new Promise(async (resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN && isAuthenticated) {
      resolve(ws)
      return
    }

    // 初始化
    if (!keyPair) await initializeKeys()
    loadDeviceToken()

    // 清理旧连接
    if (ws) {
      ws.close()
      ws = null
    }
    isAuthenticated = false

    console.log('[Gateway] Connecting to WebSocket...')
    ws = new WebSocket(GATEWAY_WS_URL)

    ws.onopen = () => {
      console.log('[Gateway] WebSocket connected, waiting for challenge...')
    }

    ws.onerror = (error) => {
      console.error('[Gateway] WebSocket error:', error)
      reject(error)
    }

    ws.onclose = (event) => {
      console.log('[Gateway] WebSocket closed:', event.code)
      ws = null
      isAuthenticated = false
      connectNonce = null
      emit('disconnected', event.code, event.reason)
      
      // 自动重连
      handleReconnect()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleMessage(data)
      } catch (e) {
        console.error('[Gateway] Failed to parse message:', e)
      }
    }

    // 等待认证完成
    const start = Date.now()
    const checkReady = () => {
      if (ws?.readyState === WebSocket.OPEN && isAuthenticated) {
        resolve(ws)
        return
      }
      if (Date.now() - start > 30000) {
        reject(new Error('Connection timeout'))
        return
      }
      setTimeout(checkReady, 100)
    }
    checkReady()
  })
}

// 处理重连
function handleReconnect(): void {
  if (reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
    console.error('[Gateway] Max reconnection attempts reached')
    emit('reconnect-failed')
    return
  }

  const delay = Math.min(
    RECONNECT_CONFIG.baseDelay * Math.pow(2, reconnectAttempts),
    RECONNECT_CONFIG.maxDelay
  )
  
  reconnectAttempts++
  console.log(`[Gateway] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)
  emit('reconnecting', reconnectAttempts, delay)
  
  setTimeout(() => {
    connect().catch(() => {})
  }, delay)
}

// ===== 消息处理 =====

function handleMessage(data: any): void {
  // JSON-RPC Response
  if (data.id !== undefined) {
    const pending = pendingRequests.get(data.id)
    if (pending) {
      pendingRequests.delete(data.id)
      if (data.error) {
        pending.reject(new Error(data.error.message))
      } else {
        pending.resolve(data.result)
      }
    }
    return
  }

  // JSON-RPC Notification (事件)
  if (data.method) {
    handleNotification(data)
  }
}

function handleNotification(notification: { method: string; params?: any }): void {
  const { method, params } = notification

  switch (method) {
    case 'hello':
      // 处理认证挑战
      handleHelloChallenge(params)
      break
    
    case 'health':
      emit('health', params)
      break
    
    case 'presence':
      emit('presence', params)
      break
    
    case 'agent':
      // Chat 事件
      if (params.event === 'message') {
        emit('chat-message', params.data)
      } else if (params.event === 'typing') {
        emit('typing', params.data)
      }
      break
    
    case 'channel:status':
      emit('channel-status', params)
      break
    
    case 'task:status':
      emit('task-status', params)
      break
    
    default:
      // 通用事件
      emit(method, params)
  }
}

async function handleHelloChallenge(params: any): Promise<void> {
  if (!keyPair) {
    console.error('[Gateway] No keyPair available')
    return
  }

  connectNonce = params.nonce
  
  try {
    const publicKey = await exportPublicKey(keyPair.publicKey)
    
    // 签名 nonce
    const signature = await signData(connectNonce, keyPair.privateKey)
    
    // 发送认证响应
    sendJsonRpc('hello', {
      publicKey,
      deviceId,
      signature,
      token: deviceToken,
    }).then(() => {
      isAuthenticated = true
      reconnectAttempts = 0
      console.log('[Gateway] Authenticated!')
      emit('connected')
    }).catch((e) => {
      console.error('[Gateway] Auth failed:', e)
    })
  } catch (e) {
    console.error('[Gateway] Failed to sign challenge:', e)
  }
}

// ===== JSON-RPC =====

function sendJsonRpc(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket not connected'))
      return
    }

    const id = ++messageId
    pendingRequests.set(id, { resolve, reject })

    ws.send(JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params: params || {},
    }))

    // 超时处理
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id)
        reject(new Error('Request timeout'))
      }
    }, 30000)
  })
}

// ===== 公开 API =====

export const gateway = {
  // 连接状态
  isConnected: () => ws?.readyState === WebSocket.OPEN && isAuthenticated,
  
  // 获取状态
  getStatus: async (): Promise<GatewayStatus> => {
    return sendJsonRpc('gateway.status')
  },

  // 获取健康状态
  getHealth: async (): Promise<GatewayHealth> => {
    return sendJsonRpc('gateway.health')
  },

  // 通道
  listChannels: async (): Promise<Channel[]> => {
    return sendJsonRpc('channels.list')
  },

  // 会话
  listSessions: async () => {
    return sendJsonRpc('sessions.list')
  },

  sendMessage: async (sessionKey: string, message: string) => {
    return sendJsonRpc('sessions.send', { sessionKey, message })
  },

  getHistory: async (sessionKey: string, limit = 50) => {
    return sendJsonRpc('sessions.history', { sessionKey, limit })
  },

  // 技能
  listSkills: async () => {
    return sendJsonRpc('skills.list')
  },

  // 定时任务
  listCron: async () => {
    return sendJsonRpc('cron.list')
  },

  // 模型
  listModels: async () => {
    return sendJsonRpc('models.list')
  },

  // 关闭连接
  disconnect: () => {
    if (ws) {
      ws.close()
      ws = null
      isAuthenticated = false
    }
  },
}

export default gateway
