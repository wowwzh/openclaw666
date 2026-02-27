// ============================================
// 通道连接管理（参考 ClawX）
// ============================================

import { Channel, ChannelType } from '../stores/types'
import { gateway } from './gateway-ws'

// 通道连接状态
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

// 通道管理器
class ChannelManager {
  private channels: Map<string, Channel> = new Map()

  // 初始化默认通道
  initDefaultChannels() {
    const defaults: Channel[] = [
      { id: 'feishu', type: 'feishu', name: '飞书', status: 'disconnected' },
      { id: 'telegram', type: 'telegram', name: 'Telegram', status: 'disconnected' },
      { id: 'discord', type: 'discord', name: 'Discord', status: 'disconnected' },
      { id: 'whatsapp', type: 'whatsapp', name: 'WhatsApp', status: 'disconnected' },
      { id: 'slack', type: 'slack', name: 'Slack', status: 'disconnected' },
      { id: 'webchat', type: 'webchat', name: '网页聊天', status: 'disconnected' },
    ]
    
    defaults.forEach(ch => this.channels.set(ch.id, ch))
  }

  // 获取所有通道
  getAll(): Channel[] {
    return Array.from(this.channels.values())
  }

  // 获取单个通道
  get(channelId: string): Channel | undefined {
    return this.channels.get(channelId)
  }

  // 获取已连接通道
  getConnected(): Channel[] {
    return this.getAll().filter(ch => ch.status === 'connected')
  }

  // 更新通道状态
  updateStatus(channelId: string, status: ConnectionStatus, error?: string) {
    const channel = this.channels.get(channelId)
    if (channel) {
      channel.status = status
      channel.error = error
      channel.lastActivity = new Date().toISOString()
    }
  }

  // 连接通道
  async connect(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId)
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`)
    }

    if (channel.status === 'connected') {
      console.log(`[ChannelManager] ${channelId} already connected`)
      return
    }

    // 更新状态为连接中
    this.updateStatus(channelId, 'connecting')

    try {
      // 调用 Gateway API
      await gateway.connectChannel(channelId)
      
      // 成功
      this.updateStatus(channelId, 'connected')
      console.log(`[ChannelManager] ${channelId} connected`)
    } catch (error) {
      // 失败
      this.updateStatus(channelId, 'error', (error as Error).message)
      console.error(`[ChannelManager] ${channelId} connection failed:`, error)
      throw error
    }
  }

  // 断开通道
  async disconnect(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId)
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`)
    }

    if (channel.status === 'disconnected') {
      console.log(`[ChannelManager] ${channelId} already disconnected`)
      return
    }

    try {
      await gateway.disconnectChannel(channelId)
      this.updateStatus(channelId, 'disconnected')
      console.log(`[ChannelManager] ${channelId} disconnected`)
    } catch (error) {
      console.error(`[ChannelManager] ${channelId} disconnect failed:`, error)
      throw error
    }
  }

  // 切换连接状态
  async toggle(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId)
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`)
    }

    if (channel.status === 'connected') {
      await this.disconnect(channelId)
    } else {
      await this.connect(channelId)
    }
  }

  // 获取 QR 码（用于 WhatsApp 等）
  async getQRCode(channelType: ChannelType): Promise<string> {
    return gateway.getChannelQRCode(channelType)
  }

  // 从 Gateway 同步通道状态
  async syncFromGateway(): Promise<void> {
    try {
      const channels = await gateway.listChannels()
      if (channels) {
        channels.forEach((ch: any) => {
          this.channels.set(ch.id, ch)
        })
      }
    } catch (error) {
      console.error('[ChannelManager] Sync failed:', error)
    }
  }
}

// 单例
export const channelManager = new ChannelManager()
channelManager.initDefaultChannels()

// 便捷函数
export async function connectChannel(channelId: string): Promise<void> {
  return channelManager.connect(channelId)
}

export async function disconnectChannel(channelId: string): Promise<void> {
  return channelManager.disconnect(channelId)
}

export async function toggleChannel(channelId: string): Promise<void> {
  return channelManager.toggle(channelId)
}

export function getChannels(): Channel[] {
  return channelManager.getAll()
}

export function getConnectedChannels(): Channel[] {
  return channelManager.getConnected()
}

export async function getChannelQRCode(channelType: ChannelType): Promise<string> {
  return channelManager.getQRCode(channelType)
}
