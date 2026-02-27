// ============================================
// 设置状态管理
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings } from './types'

interface SettingsState {
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  model: 'MiniMax-M2.5',
  thinking: '关闭',
  apiKeys: { minimax: '', tavily: '' },
  channels: { feishu: true, telegram: false, discord: false },
  theme: 'light',
  agentName: '沈幼楚',
  agentPersonality: '活泼可爱、勤奋好学',
  greeting: '你好！我是沈幼楚，有什么可以帮你的吗？',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),
      
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'openclaw-settings', // localStorage key
    }
  )
)

// 便捷访问
export const useSettings = () => useSettingsStore((s) => s.settings)
export const useTheme = () => useSettingsStore((s) => s.settings.theme)
export const useApiKeys = () => useSettingsStore((s) => s.settings.apiKeys)
export const useAgentConfig = () => useSettingsStore((s) => ({
  name: s.settings.agentName,
  personality: s.settings.agentPersonality,
  greeting: s.settings.greeting,
}))
