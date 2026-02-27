// ============================================
// 兼容层 - 保持旧的 useAppStore API
// ============================================
import { useUIStore, useGatewayStore, useTasksStore, useSkillsStore, useSettingsStore, useChatStore } from './stores'
import { useGatewayChat } from './api/gateway'

// 组合所有状态为一个兼容的 store
export const useAppStore = () => {
  const ui = useUIStore()
  const gateway = useGatewayStore()
  const tasks = useTasksStore()
  const skills = useSkillsStore()
  const settings = useSettingsStore()
  const chat = useChatStore()
  const gatewayChat = useGatewayChat()
  
  return {
    // UI 状态
    sidebarCollapsed: ui.sidebarCollapsed,
    toggleSidebar: ui.toggleSidebar,
    currentPage: ui.currentPage,
    setCurrentPage: ui.setCurrentPage,
    
    // 加载状态
    isLoading: ui.isLoading,
    setLoading: ui.setLoading,
    
    // 错误状态
    error: ui.error,
    setError: ui.setError,
    
    // 通知
    notifications: ui.notifications,
    addNotification: ui.addNotification,
    removeNotification: ui.removeNotification,
    clearNotifications: ui.clearNotifications,
    markAllAsRead: ui.markAllAsRead,
    markAsRead: ui.markAsRead,
    
    // 日志
    logs: ui.logs,
    addLog: ui.addLog,
    clearLogs: ui.clearLogs,
    
    // Gateway 状态
    gatewayStatus: {
      online: gateway.status.state === 'running',
      uptime: gateway.status.uptime ? `${Math.floor(gateway.status.uptime / 3600)}小时` : '0',
      cpu: 0,
      memory: 0,
      messagesToday: 0,
      apiCalls: 0,
    },
    setGatewayStatus: gateway.setStatus,
    fetchGatewayStatusFromApi: async () => {
      // TODO: 从 Gateway API 获取
    },
    
    // 任务
    tasks: tasks.tasks,
    setTasks: tasks.setTasks,
    toggleTask: tasks.toggleTask,
    addTask: tasks.addTask,
    updateTask: tasks.updateTask,
    deleteTask: tasks.deleteTask,
    fetchTasksFromApi: async () => {
      // TODO: 从 Gateway API 获取
    },
    toggleTaskFromApi: async () => {
      // TODO: 调用 Gateway API
    },
    
    // 技能
    skills: skills.skills,
    setSkills: skills.setSkills,
    updateSkillLevel: skills.updateSkillLevel,
    
    // 设置
    settings: settings.settings,
    updateSettings: settings.updateSettings,
    
    // 消息 - 使用 Gateway API
    messages: gatewayChat.messages,
    addMessage: chat.addMessage,
    clearMessages: gatewayChat.clearMessages,
    conversationId: chat.currentSession,
    setConversationId: chat.setCurrentSession,
    sendMessage: gatewayChat.sendMessage,
    isConnected: gatewayChat.connected,
  }
}

export default useAppStore
