// 全局快捷键组件
import { useEffect } from 'react'
import { useAppStore } from '../store'

const shortcuts = [
  { key: '1', modifier: 'altKey', page: 'dashboard', name: '仪表盘' },
  { key: '2', modifier: 'altKey', page: 'chat', name: '对话' },
  { key: '3', modifier: 'altKey', page: 'news', name: '资讯' },
  { key: '4', modifier: 'altKey', page: 'skills', name: '技能中心' },
  { key: '5', modifier: 'altKey', page: 'achievements', name: '成就中心' },
  { key: '6', modifier: 'altKey', page: 'tasks', name: '任务' },
  { key: '7', modifier: 'altKey', page: 'settings', name: '设置' },
]

export function GlobalShortcuts() {
  const { setCurrentPage } = useAppStore()
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key === e.key && e[s.modifier as keyof KeyboardEvent]
      )
      if (shortcut) {
        e.preventDefault()
        setCurrentPage(shortcut.page)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCurrentPage])
  
  return null
}

// 快捷键说明组件
export function ShortcutsHelp() {
  return (
    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginTop: '1rem' }}>
      <h4 style={{ marginBottom: '0.5rem', color: '#475569' }}>⌨️ 快捷键</h4>
      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
        {shortcuts.map(s => (
          <span key={s.key}><kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>Alt+{s.key}</kbd>{s.name}</span>
        ))}
      </div>
    </div>
  )
}
