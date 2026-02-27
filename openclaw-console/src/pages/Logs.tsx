// 日志页面 - 真实系统日志
import { useState, useEffect } from 'react'
import { Trash2, Download, Info, AlertTriangle, XCircle, CheckCircle, Search, RefreshCw } from 'lucide-react'
import { fetchLocalLogs, LogEntry } from '../api/local'

export function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all')
  const [search, setSearch] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await fetchLocalLogs(100)
      setLogs(data)
    } catch (e) {
      console.error('Failed to load logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    const interval = setInterval(loadLogs, 30000) // 每30秒刷新
    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info size={14} color="#2563eb" />
      case 'success': return <CheckCircle size={14} color="#10b981" />
      case 'warning': return <AlertTriangle size={14} color="#f59e0b" />
      case 'error': return <XCircle size={14} color="#ef4444" />
      default: return <Info size={14} color="#64748b" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'info': return '#eff6ff'
      case 'success': return '#ecfdf5'
      case 'warning': return '#fffbeb'
      case 'error': return '#fef2f2'
      default: return '#f8fafc'
    }
  }

  const filteredLogs = logs
    .filter(l => filter === 'all' || l.type === filter)
    .filter(l => !search || l.message.toLowerCase().includes(search.toLowerCase()))

  const exportLogs = () => {
    const content = filteredLogs.map(l => `[${l.ts}] [${l.type.toUpperCase()}] ${l.message}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `openclaw-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>📋 系统日志</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={loadLogs}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#475569'
            }}
          >
            <RefreshCw size={14} /> 刷新
          </button>
          <button
            onClick={exportLogs}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: '#3b82f6', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'white'
            }}
          >
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="搜索日志..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem',
              border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'white', padding: '0.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {(['all', 'info', 'success', 'warning', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.25rem 0.75rem', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.75rem',
                background: filter === f ? '#3b82f6' : 'transparent',
                color: filter === f ? 'white' : '#64748b'
              }}
            >
              {f === 'all' ? '全部' : f === 'success' ? '成功' : f}
            </button>
          ))}
        </div>
      </div>

      {/* 日志列表 */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            加载中...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            暂无日志记录
          </div>
        ) : (
          <div style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9',
                  background: getBgColor(log.type)
                }}
              >
                {getIcon(log.type)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    {new Date(log.ts).toLocaleString('zh-CN')}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>{log.message}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {log.source}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
        共 {filteredLogs.length} 条记录 • 每30秒自动刷新
      </div>
    </div>
  )
}
