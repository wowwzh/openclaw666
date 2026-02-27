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
  // Agent配置
  model: 'MiniMax-M2.5',
  thinking: '关闭',
  agentName: '沈幼楚',
  agentPersonality: '活泼可爱、勤奋好学',
  greeting: '你好！我是沈幼楚，有什么可以帮你的吗？',

  // Gateway配置
  gatewayHost: 'localhost',
  gatewayPort: 18789,
  gatewayToken: '',
  gatewayAutoStart: true,
  gatewayAutoConnect: true,

  // API配置
  apiKeys: { minimax: '', tavily: '' },

  // 通道配置
  channels: { feishu: true, telegram: false, discord: false },

  // UI配置
  theme: 'light',
  startMinimized: false,
  launchAtStartup: false,

  // 通知配置
  notifications: {
    taskComplete: true,
    learningReport: true,
    errorAlert: true,
    evomapUpdate: false,
  },
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
export const useGatewayConfig = () => useSettingsStore((s) => ({
  host: s.settings.gatewayHost,
  port: s.settings.gatewayPort,
  token: s.settings.gatewayToken,
  autoStart: s.settings.gatewayAutoStart,
  autoConnect: s.settings.gatewayAutoConnect,
}))
