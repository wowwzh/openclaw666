// Channels API 调用
const API_BASE_URL = 'http://localhost:18789/api'

function getToken(): string {
  return localStorage.getItem('gateway_token') || ''
}

export interface Channel {
  id: string
  name: string
  type: 'telegram' | 'discord' | 'whatsapp' | 'feishu' | 'signal' | 'webchat'
  status: 'connected' | 'disconnected' | 'error'
  lastMessage?: string
  unreadCount?: number
}

export interface ChannelStats {
  messagesToday: number
  messagesWeek: number
  messagesMonth: number
  activeChannels: number
}

// 获取频道列表
export async function fetchChannels(): Promise<Channel[]> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/channels`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch channels: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.channels || data || []
}

// 获取频道状态
export async function fetchChannelStatus(channelId: string): Promise<Channel> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/channels/${channelId}/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch channel status: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data
}

// 获取频道统计
export async function fetchChannelStats(): Promise<ChannelStats> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/channels/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch channel stats: ${response.statusText}`)
  }
  
  const data = await response.json()
  return {
    messagesToday: data.messages_today || data.messagesToday || 0,
    messagesWeek: data.messages_week || data.messagesWeek || 0,
    messagesMonth: data.messages_month || data.messagesMonth || 0,
    activeChannels: data.active_channels || data.activeChannels || 0,
  }
}

// 发送消息
export async function sendChannelMessage(channelId: string, message: string): Promise<{ message_id: string }> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`)
  }
  
  return response.json()
}

// 获取消息历史
export async function fetchChannelMessages(channelId: string, limit = 50): Promise<any[]> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/channels/${channelId}/messages?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.messages || data || []
}
