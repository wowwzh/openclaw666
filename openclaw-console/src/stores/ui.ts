// ============================================
// UI 状态管理
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Notification, Log } from './types'

interface UIState {
  // 导航
  sidebarCollapsed: boolean
  currentPage: string
  
  // 加载状态
  isLoading: {
    gatewayStatus: boolean
    tasks: boolean
    chat: boolean
  }
  
  // 错误状态
  error: {
    gatewayStatus: string | null
    tasks: string | null
  }
  
  // 通知
  notifications: Notification[]
  
  // 日志
  logs: Log[]
  
  // Actions - 导航
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentPage: (page: string) => void
  
  // Actions - 加载状态
  setLoading: (key: 'gatewayStatus' | 'tasks' | 'chat', value: boolean) => void
  
  // Actions - 错误状态
  setError: (key: 'gatewayStatus' | 'tasks', error: string | null) => void
  clearErrors: () => void
  
  // Actions - 通知
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  
  // Actions - 日志
  addLog: (log: Omit<Log, 'id'>) => void
  clearLogs: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // 初始状态
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      
      isLoading: {
        gatewayStatus: false,
        tasks: false,
        chat: false,
      },
      
      error: {
        gatewayStatus: null,
        tasks: null,
      },
      
      notifications: [],
      
      logs: [
        { id: '1', type: 'success', message: '早间汇报任务执行成功', time: '08:00' },
        { id: '2', type: 'success', message: '早间天气任务执行成功', time: '07:00' },
        { id: '3', type: 'info', message: '技能练习任务执行中', time: '12:20' },
        { id: '4', type: 'success', message: 'EvoMap检查完成', time: '11:00' },
      ],

      // 导航 Actions
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // 加载状态 Actions
      setLoading: (key, value) => set((state) => ({ 
        isLoading: { ...state.isLoading, [key]: value } 
      })),
      
      // 错误状态 Actions
      setError: (key, error) => set((state) => ({ 
        error: { ...state.error, [key]: error } 
      })),
      
      clearErrors: () => set({ 
        error: { gatewayStatus: null, tasks: null } 
      }),
      
      // 通知 Actions
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Date.now().toString(),
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 50), // 最多保留50条
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // 日志 Actions
      addLog: (log) => set((state) => ({
        logs: [
          {
            ...log,
            id: Date.now().toString(),
          },
          ...state.logs,
        ].slice(0, 100), // 最多保留100条
      })),
      
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'openclaw-ui', // localStorage key
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        currentPage: state.currentPage,
      }), // 只持久化部分状态
    }
  )
)

// 便捷访问
export const useCurrentPage = () => useUIStore((s) => s.currentPage)
export const useSidebarCollapsed = () => useUIStore((s) => s.sidebarCollapsed)
export const useNotifications = () => useUIStore((s) => s.notifications)
export const useUnreadCount = () => useUIStore((s) => s.notifications.filter(n => !n.read).length)
export const useLogs = () => useUIStore((s) => s.logs)
