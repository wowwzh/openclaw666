// 主题切换 + 全局刷新组件
import { useState, useEffect } from 'react'
import { Sun, Moon, RefreshCw } from 'lucide-react'
import { useAppStore } from '../store'

interface ThemeToggleProps {
  onToggle?: (isDark: boolean) => void
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [refreshing, setRefreshing] = useState(false)
  const { fetchGatewayStatusFromApi, fetchTasksFromApi } = useAppStore()
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    onToggle?.(isDark)
  }, [isDark, onToggle])
  
  // 监听全局刷新事件
  useEffect(() => {
    const handleGlobalRefresh = () => {
      setRefreshing(true)
      fetchGatewayStatusFromApi()
      fetchTasksFromApi()
      setTimeout(() => setRefreshing(false), 1000)
    }
    window.addEventListener('global-refresh', handleGlobalRefresh)
    return () => window.removeEventListener('global-refresh', handleGlobalRefresh)
  }, [fetchGatewayStatusFromApi, fetchTasksFromApi])
  
  const handleRefresh = () => {
    setRefreshing(true)
    fetchGatewayStatusFromApi()
    fetchTasksFromApi()
    setTimeout(() => setRefreshing(false), 1000)
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999
    }}>
      {/* 刷新按钮 */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        title="刷新所有数据"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: isDark ? '#1e293b' : '#f1f5f9',
          cursor: refreshing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.2s'
        }}
      >
        <RefreshCw 
          size={20} 
          color={isDark ? '#94a3b8' : '#64748b'}
          style={{ 
            animation: refreshing ? 'spin 1s linear infinite' : 'none'
          }} 
        />
      </button>
      
      {/* 主题切换按钮 */}
      <button
        onClick={() => setIsDark(!isDark)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: isDark ? '#1e293b' : '#f1f5f9',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        title={isDark ? '切换到浅色模式' : '切换到深色模式'}
      >
        {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#64748b" />}
      </button>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
