// 增强版仪表盘 - Agent动态展示
import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Brain, Code, BookOpen, Search, TestTube, Activity, Zap, Users } from 'lucide-react'
import { fetchGatewayStatus, fetchChannels, fetchEvolverStatus } from '../api/gateway'

// 频道颜色映射
const channelColors: Record<string, string> = {
  feishu: '#2563eb',
  telegram: '#10b981',
  discord: '#8b5cf6',
  whatsapp: '#25D366',
  default: '#64748b'
}

function AgentCard({ agent }: { agent: { id: string; name: string; icon: any; status: string; color: string; activity: string; hours: number } }) {
  const [hovered, setHovered] = useState(false)
  const Icon = agent.icon
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', padding: '1rem', borderRadius: '12px',
        border: hovered ? `1px solid ${agent.color}40` : '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${agent.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={20} color={agent.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'nowrap' }}>{agent.name}</div>
          <div style={{ fontSize: '0.75rem', color: agent.color, marginTop: '2px', whiteSpace: 'nowrap' }}>{agent.activity}</div>
        </div>
        <div style={{
          fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px',
          background: agent.status === '空闲' ? '#f1f5f9' : `${agent.color}15`,
          color: agent.status === '空闲' ? '#64748b' : agent.color,
          fontWeight: '500',
          flexShrink: 0
        }}>
          {agent.status}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ label, progress, color }: { label: string, progress: number, color: string }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`, background: color,
          borderRadius: '3px', transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [gatewayStatus, setGatewayStatus] = useState<any>(null)
  const [channels, setChannels] = useState<any[]>([])
  const [evolverStatus, setEvolverStatus] = useState<any>(null)
  const [healthData, setHealthData] = useState<any>(null)
  
  // 使用 useMemo 缓存数据转换
  const channelData = useMemo(() => channels.map((ch, idx) => ({
    name: ch.name || `Channel ${idx + 1}`,
    value: ch.connected ? 50 : 10,
    color: channelColors[ch.name] || channelColors.default
  })), [channels])

  const defaultChannelData = useMemo(() => [
    { name: '飞书', value: 75, color: '#2563eb' }
  ], [])

  const skillData = useMemo(() => [
    { category: 'AI/ML', count: 4 },
    { category: '前端', count: 4 },
    { category: '后端', count: 6 },
    { category: '工具', count: 4 },
  ], [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const status = await fetchGatewayStatus()
        const ch = await fetchChannels()
        const evo = await fetchEvolverStatus()
        
        if (status) setGatewayStatus(status)
        if (ch) setChannels(ch)
        if (evo) setEvolverStatus(evo)
        
        const latestHealth = (window as any).latestHealthData
        if (latestHealth) {
          setHealthData(latestHealth)
        }
      } catch (e) {
        console.log('Dashboard data load error:', e)
      }
    }
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const sessions = gatewayStatus?.sessions || 0
  const agents = healthData?.agents || []
  
  const agentStatusData = agents.map((agent: any) => {
    const sessionCount = agent.sessions?.count || 0
    const name = agent.name || agent.agentId
    let status = '空闲'
    let activity = '等待任务'
    let color = '#64748b'
    
    if (agent.heartbeat?.enabled) {
      if (sessionCount > 0) {
        status = '工作中'
        activity = `${sessionCount} 个会话`
        color = '#3b82f6'
      } else {
        status = '监听中'
        activity = '等待触发'
        color = '#10b981'
      }
    }
    
    return {
      id: agent.agentId,
      name,
      icon: Brain,
      status,
      color,
      activity,
      hours: Math.floor(Math.random() * 8)
    }
  })

  const agentIcons: Record<string, any> = {
    'main': Brain,
    'coder': Code,
    'researcher': Search,
    'learner': BookOpen,
    'tester': TestTube,
    'analyst': Activity,
    'architect': Zap,
    'reviewer': Users
  }

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📊 控制台</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>活跃会话</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{sessions}</div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Agent数量</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{agents.length || 8}</div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>技能数量</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>18</div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>运行时间</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>24h</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>📡 频道状态</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={channelData.length > 0 ? channelData : defaultChannelData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                {(channelData.length > 0 ? channelData : defaultChannelData).map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            {(channelData.length > 0 ? channelData : defaultChannelData).map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>🛠️ 技能分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={skillData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>🤖 Agent 状态</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {agentStatusData.length > 0 ? agentStatusData.map(agent => (
            <AgentCard key={agent.id} agent={{ ...agent, icon: agentIcons[agent.id] || Brain }} />
          )) : [
            { id: '1', name: '主Agent', icon: Brain, status: '监听中', color: '#10b981', activity: '等待触发', hours: 6 },
            { id: '2', name: '代码助手', icon: Code, status: '空闲', color: '#64748b', activity: '等待任务', hours: 4 },
            { id: '3', name: '研究员', icon: Search, status: '工作中', color: '#3b82f6', activity: '2 个会话', hours: 3 },
          ].map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>📈 学习进度</h3>
        <ProgressBar label="算法练习" progress={65} color="#3b82f6" />
        <ProgressBar label="项目实战" progress={42} color="#10b981" />
        <ProgressBar label="技能掌握" progress={78} color="#8b5cf6" />
        <ProgressBar label="知识积累" progress={55} color="#f59e0b" />
      </div>
    </div>
  )
}
