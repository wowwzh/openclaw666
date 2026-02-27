// ============================================
// 主题管理（参考 ClawX）
// ============================================

import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// 检测系统主题
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// 解析主题
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

// 应用主题到 DOM
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
}

// 创建主题 Store
export function createThemeStore() {
  return persist<ThemeState>(
    (set, get) => ({
      theme: 'light',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme)
        set({ theme, resolvedTheme: resolved })
        applyTheme(resolved)
        
        // 监听系统主题变化
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          const handler = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? 'dark' : 'light'
            set({ resolvedTheme: newTheme })
            applyTheme(newTheme)
          }
          mediaQuery.addEventListener('change', handler)
        }
      },

      toggleTheme: () => {
        const { theme, resolvedTheme } = get()
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
    }),
    {
      name: 'openclaw-theme',
    }
  )
}

// 初始化主题
export function initTheme(initialTheme?: Theme) {
  const store = createThemeStore()
  const theme = initialTheme || 'light'
  store.getState().setTheme(theme)
  return store
}

// 主题变量
export const themeVars = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--bg-tertiary': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',
    '--border': '#e2e8f0',
    '--accent': '#3b82f6',
    '--accent-hover': '#2563eb',
    '--success': '#22c55e',
    '--warning': '#f59e0b',
    '--error': '#ef4444',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--bg-tertiary': '#334155',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#64748b',
    '--border': '#334155',
    '--accent': '#3b82f6',
    '--accent-hover': '#60a5fa',
    '--success': '#22c55e',
    '--warning': '#f59e0b',
    '--error': '#ef4444',
  },
}
