// ============================================
// OpenClaw Console - Store 导出
// ============================================

// Types
export * from './types'

// Stores
export { useGatewayStore, useGatewayStatus, useGatewayHealth, useGatewayState, useGatewayVersion, useGatewayUptime } from './gateway'
export { useTasksStore, useTasks, useActiveTasks, useTaskById } from './tasks'
export { useSkillsStore, useSkills, useLocalSkills, useMarketSkills, useSkillsByCategory } from './skills'
export { useChatStore, useMessages, useCurrentSession, useIsSending, useStreamingText } from './chat'
export { useSettingsStore, useSettings, useTheme, useApiKeys, useAgentConfig } from './settings'
export { useUIStore, useCurrentPage, useSidebarCollapsed, useNotifications, useUnreadCount, useLogs } from './ui'
export { useChannelsStore, useChannels, useConnectedChannels, useChannelById } from './channels'
export { useProvidersStore, useProviders, useActiveProvider, useEnabledProviders } from './providers'

// 默认导出（便于一次性导入）
import { useGatewayStore } from './gateway'
import { useTasksStore } from './tasks'
import { useSkillsStore } from './skills'
import { useChatStore } from './chat'
import { useSettingsStore } from './settings'
import { useUIStore } from './ui'

export const stores = {
  gateway: useGatewayStore,
  tasks: useTasksStore,
  skills: useSkillsStore,
  chat: useChatStore,
  settings: useSettingsStore,
  ui: useUIStore,
}

export default stores
