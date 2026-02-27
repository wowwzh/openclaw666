// 通知气泡组件 - 右下角
import { useState, useMemo, useCallback } from 'react'
import { MessageSquare, Bell, Package, AlertCircle, ChevronRight } from 'lucide-react'

interface Notification {
  id: string
  type: 'message' | 'task' | 'evomap' | 'system'
  title: string
  content: string
  timestamp: number
  read: boolean
  link?: string
}

interface NotificationBellProps {
  notifications: Notification[]
  onNotificationClick?: (notification: Notification) => void
  onClear?: () => void
}

const iconMap = {
  message: MessageSquare,
  task: Bell,
  evomap: Package,
  system: AlertCircle,
}

const colorMap = {
  message: '#8b5cf6',
  task: '#f59e0b',
  evomap: '#10b981',
  system: '#64748b',
}

export function NotificationBell({ notifications, onNotificationClick, onClear }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // 使用 useMemo 缓存未读数量，避免每次渲染都重新计算
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  )
  
  // 使用 useCallback 缓存时间格式化函数
  const formatTime = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return `${Math.floor(diff / 86400000)}天前`
  }, [])
  
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {/* 铃铛按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          position: 'relative'
        }}
      >
        <Bell size={22} color="white" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#ef4444', color: 'white', fontSize: '11px',
            fontWeight: 'bold', minWidth: '18px', height: '18px',
            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* 通知列表 */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '56px', right: '0',
          width: '320px', maxHeight: '400px',
          background: 'white', borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          {/* 标题栏 */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>通知</span>
            {onClear && (
              <button
                onClick={onClear}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
              >
                清空
              </button>
            )}
          </div>
          
          {/* 通知列表 */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                暂无通知
              </div>
            ) : (
              notifications.map(n => {
                const Icon = iconMap[n.type] || Bell
                return (
                  <div
                    key={n.id}
                    onClick={() => onNotificationClick?.(n)}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                      background: n.read ? 'white' : '#f8fafc',
                      cursor: 'pointer', display: 'flex', gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: `${colorMap[n.type]}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Icon size={16} color={colorMap[n.type]} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', fontSize: '13px' }}>{n.title}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTime(n.timestamp)}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.content}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
