import React, { Component, type ReactNode } from 'react'
import { useAppStore } from './store'
import { useGatewayStore } from './stores/gateway'
import { Sidebar } from './components/Sidebar'
import { NotificationBell } from './components/NotificationBell'
import { ThemeToggle } from './components/ThemeToggle'
import { GlobalShortcuts } from './components/GlobalShortcuts'

// ============ Error Boundary ============
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class PageErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Page loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', { 
        style: { 
          padding: '40px', 
          textAlign: 'center',
          color: '#ef4444'
        } 
      },
        React.createElement('h2', null, '页面加载失败'),
        React.createElement('p', null, this.state.error?.message || '未知错误'),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: {
            marginTop: '16px',
            padding: '8px 16px',
            cursor: 'pointer'
          }
        }, '刷新页面')
      )
    }
    return this.props.children
  }
}

// 非懒加载页面 - 避免打包问题
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import News from './pages/News'
import CommandPanel from './pages/CommandPanel'
import Analytics from './pages/Analytics'
import Practice from './pages/Practice'
import Status from './pages/Status'
import { Tasks } from './pages/Tasks'
import { Skills } from './pages/Skills'
import { Achievements } from './pages/Achievements'
import { EmailPage } from './pages/Email'
import { Logs } from './pages/Logs'
import { Profile } from './pages/Profile'
import { SettingsPage } from './pages/Settings'
import KnowledgeBase from './pages/KnowledgeBase'

// ============ 页面渲染函数 ============
function renderPage(pageId: string) {
  switch (pageId) {
    case 'dashboard': return React.createElement(Dashboard)
    case 'chat': return React.createElement(Chat)
    case 'news': return React.createElement(News)
    case 'command': return React.createElement(CommandPanel)
    case 'analytics': return React.createElement(Analytics)
    case 'practice': return React.createElement(Practice)
    case 'status': return React.createElement(Status)
    case 'tasks': return React.createElement(Tasks)
    case 'skills': return React.createElement(Skills)
    case 'achievements': return React.createElement(Achievements)
    case 'email': return React.createElement(EmailPage)
    case 'profile': return React.createElement(Profile)
    case 'logs': return React.createElement(Logs)
    case 'settings': return React.createElement(SettingsPage)
    case 'knowledge': return React.createElement(KnowledgeBase)
    default: return React.createElement(Dashboard)
  }
}

function App() {
  const { currentPage, notifications, setCurrentPage } = useAppStore()
  
  // 延迟初始化 Gateway store (避免阻塞页面加载)
  const gatewayInit = useGatewayStore((s) => s.init)
  React.useEffect(() => {
    // 延迟2秒后再初始化，让页面先渲染出来
    const timer = setTimeout(() => {
      gatewayInit().catch(console.warn)
    }, 2000)
    return () => clearTimeout(timer)
  }, [gatewayInit])
  
  // 暂时注释掉历史加载，避免白屏
  // useEffect(() => {
  //   loadHistory()
  // }, [])
  
  const handleNotificationClick = (notification: any) => {
    if (notification.link) {
      setCurrentPage(notification.link)
    }
  }
  
  return React.createElement('div', { style: { display: 'flex', height: '100vh', overflow: 'hidden' } },
    React.createElement(Sidebar),
    React.createElement('main', { style: { flex: 1, overflow: 'auto', background: '#f8fafc' } },
      React.createElement(PageErrorBoundary, null,
        renderPage(currentPage)
      )
    ),
    React.createElement(NotificationBell, { notifications, onNotificationClick: handleNotificationClick }),
    React.createElement(ThemeToggle),
    React.createElement(GlobalShortcuts)
  )
}

export default App
