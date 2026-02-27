// 侧边栏组件 - 白色简约风格
import { useAppStore } from '../store'
import { 
  MessageSquare, BarChart3, Settings, Server,
  ChevronLeft, ChevronRight, ListTodo, FileText, BookOpen,
  Zap, BarChart, User, BookMarked, Trophy, Mail, Lightbulb,
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', name: '仪表盘', icon: BarChart3 },
  { id: 'chat', name: '对话', icon: MessageSquare },
  { id: 'news', name: '资讯', icon: BookOpen },
  { id: 'knowledge', name: '知识库', icon: Lightbulb },
  { id: 'command', name: '快捷命令', icon: Zap },
  { id: 'status', name: '系统状态', icon: Server },
  { id: 'analytics', name: '数据统计', icon: BarChart },
  { id: 'practice', name: '练习记录', icon: BookMarked },
  { id: 'tasks', name: '任务管理', icon: ListTodo },
  { id: 'skills', name: '技能中心', icon: FileText },
  { id: 'achievements', name: '成就中心', icon: Trophy },
  { id: 'email', name: '邮箱', icon: Mail },
  { id: 'profile', name: '我的展示', icon: User },
  { id: 'logs', name: '系统日志', icon: FileText },
  { id: 'settings', name: '设置', icon: Settings },
]

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar } = useAppStore()
  
  return (
    <div style={{
      width: sidebarCollapsed ? '60px' : '200px',
      height: '100vh', 
      background: 'white', 
      borderRight: '1px solid #e2e8f0',
      display: 'flex', 
      flexDirection: 'column',
      transition: 'width 0.2s ease'
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between'
      }}>
        {!sidebarCollapsed && (
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>
            OpenClaw
          </span>
        )}
        <button 
          onClick={toggleSidebar}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', padding: '4px', borderRadius: '4px'
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 菜单 */}
      <div style={{ flex: 1, padding: '0.5rem', overflowY: 'auto' }}>
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: sidebarCollapsed ? '0.75rem' : '0.75rem 1rem',
                marginBottom: '0.25rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isActive ? '#3b82f6' : 'transparent',
                color: isActive ? 'white' : '#64748b',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '500' : '400',
                fontSize: '0.875rem'
              }}
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
