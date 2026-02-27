// 系统状态页面 - 整合了系统监控功能
import { useState, useEffect } from 'react'
import {
  fetchGatewayStatus,
  fetchChannels,
  fetchEvolverStatus,
  fetchTasks,
  type GatewayStatus,
  type Channel,
  type EvolverStatus,
  type Task,
} from '../api/gateway'
import {
  Server,
  MessageSquare,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  Clock,
} from 'lucide-react'

// 将 Gateway 返回的 uptime(秒) 转成人类可读字符串
function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return '-'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts = []
  if (days) parts.push(`${days}天`)
  if (hours) parts.push(`${hours}时`)
  if (minutes || parts.length === 0) parts.push(`${minutes}分`)
  return parts.join(' ')
}

export default function Status() {
  const [gateway, setGateway] = useState<GatewayStatus | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [evolver, setEvolver] = useState<EvolverStatus | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setError(null)

      const [gw, ch, ev, tk] = await Promise.all([
        fetchGatewayStatus(),
        fetchChannels(),
        fetchEvolverStatus(),
        fetchTasks(),
      ])

      setGateway(gw)
      setChannels(ch)
      setEvolver(ev)
      setTasks(tk)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !gateway) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <Activity className="animate-spin" style={{ width: 32, height: 32, margin: '0 auto 1rem' }} />
        加载中...
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
        系统状态
      </h1>

      {error && (
        <div style={{ 
          background: '#fef2f2', border: '1px solid #fecaca', 
          padding: '1rem', borderRadius: '8px', marginBottom: '1rem', color: '#dc2626' 
        }}>
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {/* Gateway状态 */}
      <div style={{ 
        background: 'white', padding: '1.5rem', borderRadius: '12px', 
        border: '1px solid #e2e8f0', marginBottom: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Server size={20} color="#3b82f6" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Gateway</h2>
          {gateway ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>运行时间</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
              {formatUptime(gateway?.uptime)}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>内存使用</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
              {gateway?.memory
                ? `${Math.round((gateway.memory.used / gateway.memory.total) * 100)}%`
                : '-'}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>会话数</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
              {gateway?.sessions ?? '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Evolver 状态 */}
      {evolver && (
        <div style={{ 
          background: 'white', padding: '1.5rem', borderRadius: '12px', 
          border: '1px solid #e2e8f0', marginBottom: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={20} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>EvoMap Evolver</h2>
            {evolver.running ? 
              <CheckCircle size={16} color="#10b981" /> : 
              <XCircle size={16} color="#ef4444" />
            }
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>运行状态</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: evolver.running ? '#10b981' : '#ef4444' }}>
                {evolver.running ? '运行中' : '已停止'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>模式</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                {evolver.mode || '-'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}> Reputation</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {evolver.reputation || '-'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}> Node ID</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#64748b', wordBreak: 'break-all' }}>
                {evolver.nodeId || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 频道列表 */}
      <div style={{ 
        background: 'white', padding: '1.5rem', borderRadius: '12px', 
        border: '1px solid #e2e8f0', marginBottom: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <MessageSquare size={20} color="#3b82f6" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>频道连接</h2>
        </div>

        {channels.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            暂无连接频道
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {channels.map(channel => (
              <div key={channel.id} style={{
                padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                background: channel.status === 'connected' ? '#f0fdf4' : '#fef2f2'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{channel.name}</span>
                  <span style={{ 
                    fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px',
                    background: channel.status === 'connected' ? '#dcfce7' : '#fecaca',
                    color: channel.status === 'connected' ? '#16a34a' : '#dc2626'
                  }}>
                    {channel.status === 'connected' ? '已连接' : '未连接'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="#8b5cf6" /> 定时任务
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tasks.slice(0, 8).map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} color={task.enabled ? '#10b981' : '#94a3b8'} />
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{task.name || task.id}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {task.schedule}
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    borderRadius: '9999px',
                    background: task.enabled ? '#dcfce7' : '#f1f5f9',
                    color: task.enabled ? '#16a34a' : '#64748b',
                  }}
                >
                  {task.enabled ? '启用' : '停用'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
