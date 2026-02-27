// ============================================
// 定时任务状态管理
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CronTask } from './types'

interface TasksState {
  tasks: CronTask[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setTasks: (tasks: CronTask[]) => void
  addTask: (task: CronTask) => void
  updateTask: (id: string, updates: Partial<CronTask>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      // 默认任务
      tasks: [
        { 
          id: '1', 
          name: '早间汇报', 
          description: '每日早上8点汇报学习进度和任务完成情况', 
          status: 'idle', 
          nextRun: '08:00', 
          schedule: '0 8 * * *', 
          command: '/tasks/morning',
          enabled: true,
          lastRun: '08:00'
        },
        { 
          id: '2', 
          name: '技能练习', 
          description: '每20分钟执行算法/刷题或项目练习', 
          status: 'idle', 
          nextRun: '20分钟', 
          schedule: '*/20 * * * *', 
          command: '/tasks/practice',
          enabled: true,
          lastRun: '刚刚'
        },
        { 
          id: '3', 
          name: 'EvoMap检查', 
          description: '检查EvoMap平台热门方案', 
          status: 'idle', 
          nextRun: '30分钟', 
          schedule: '*/30 * * * *', 
          command: '/evomap/check',
          enabled: true,
          lastRun: '刚刚'
        },
        { 
          id: '4', 
          name: '凌晨技能挖掘', 
          description: '从 skills.sh 挖掘新技能', 
          status: 'idle', 
          nextRun: '-', 
          schedule: '0 0 * * *', 
          command: '/skills/mine',
          enabled: false,
          lastRun: '昨天'
        },
      ],
      isLoading: false,
      error: null,

      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),
      
      updateTask: (id, updates) => set((state) => ({ 
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t) 
      })),
      
      deleteTask: (id) => set((state) => ({ 
        tasks: state.tasks.filter(t => t.id !== id) 
      })),
      
      toggleTask: (id) => set((state) => ({ 
        tasks: state.tasks.map(t => t.id === id 
          ? { ...t, enabled: !t.enabled } 
          : t
        ) 
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'openclaw-tasks', // localStorage key
    }
  )
)

// 便捷访问
export const useTasks = () => useTasksStore((s) => s.tasks)
export const useActiveTasks = () => useTasksStore((s) => s.tasks.filter(t => t.enabled))
export const useTaskById = (id: string) => useTasksStore((s) => s.tasks.find(t => t.id === id))
