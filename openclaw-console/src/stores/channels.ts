// ============================================
// 通道状态管理（参考 ClawX）
// ============================================
import { create } from 'zustand'
import { Channel } from './types'

interface ChannelsState {
  channels: Channel[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setChannels: (channels: Channel[]) => void
  updateChannel: (id: string, updates: Partial<Channel>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useChannelsStore = create<ChannelsState>()(
  // 不使用 persist，通道状态从 Gateway 实时获取
  (set) => ({
    channels: [
      // 默认通道（离线状态）
      { id: 'feishu', type: 'feishu', name: '飞书', status: 'disconnected' },
      { id: 'telegram', type: 'telegram', name: 'Telegram', status: 'disconnected' },
      { id: 'discord', type: 'discord', name: 'Discord', status: 'disconnected' },
      { id: 'whatsapp', type: 'whatsapp', name: 'WhatsApp', status: 'disconnected' },
    ],
    isLoading: false,
    error: null,

    setChannels: (channels) => set({ channels }),
    
    updateChannel: (id, updates) => set((state) => ({ 
      channels: state.channels.map(c => c.id === id ? { ...c, ...updates } : c) 
    })),
    
    setLoading: (isLoading) => set({ isLoading }),
    
    setError: (error) => set({ error }),
  })
)

// 便捷访问
export const useChannels = () => useChannelsStore((s) => s.channels)
export const useConnectedChannels = () => useChannelsStore((s) => s.channels.filter(c => c.status === 'connected'))
export const useChannelById = (id: string) => useChannelsStore((s) => s.channels.find(c => c.id === id))
