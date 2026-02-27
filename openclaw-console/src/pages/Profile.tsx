// 我的展示页面 - Agent管理+成就系统
import { useState, useEffect } from 'react'
import { User, Star, Award, Activity, Bot, BookOpen, Code, Search, TestTube, Rocket, Shield, Edit2, Save, Plus, Trophy, Zap } from 'lucide-react'
import { fetchAchievements, Achievement } from '../api/achievements'

// Agent配置
const defaultAgents = [
  { id: 'main', name: '沈幼楚', icon: '👧', role: '主Agent', color: '#8b5cf6', description: 'AI助手 - 活泼可爱' },
  { id: 'researcher', name: 'Researcher', icon: '🔍', role: '调研', color: '#8b5cf6', description: '信息搜集与分析' },
  { id: 'learner', name: 'Learner', icon: '📚', role: '学习', color: '#10b981', description: '自主学习与研究' },
  { id: 'coder', name: 'Coder', icon: '💻', role: '编程', color: '#f59e0b', description: '代码编写与实现' },
  { id: 'analyst', name: 'Analyst', icon: '📊', role: '分析', color: '#3b82f6', description: '数据分析与洞察' },
  { id: 'architect', name: 'Architect', icon: '🏗️', role: '架构', color: '#06b6d4', description: '系统架构设计' },
  { id: 'reviewer', name: 'Reviewer', icon: '🔍', role: '审查', color: '#ef4444', description: '代码审查与优化' },
  { id: 'tester', name: 'Tester', icon: '🧪', role: '测试', color: '#ec4899', description: '测试与验证' },
  { id: 'deployer', name: 'Deployer', icon: '🚀', role: '部署', color: '#14b8a6', description: '部署与运维' },
]

export function Profile() {
  const [agents, setAgents] = useState(defaultAgents)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  
  useEffect(() => {
    const load = async () => {
      const data = await fetchAchievements()
      setAchievements(data)
      setLoading(false)
    }
    load()
  }, [])
  
  // 获取今日成就
  const getTodayAchievements = (agentId: string) => {
    const today = new Date().toISOString().split('T')[0]
    return achievements.filter(a => 
      a.agentId === agentId && 
      a.unlocked
    ).slice(0, 3)
  }
  
  // 获取Agent统计
  const getAgentStats = (agentId: string) => {
    const agentAchievements = achievements.filter(a => a.agentId === agentId)
    const unlocked = agentAchievements.filter(a => a.unlocked).length
    const inProgress = agentAchievements.filter(a => !a.unlocked && a.progress > 0).length
    return { unlocked, inProgress, total: agentAchievements.length }
  }
  
  const handleEditStart = (agent: typeof agents[0]) => {
    setEditingId(agent.id)
    setEditName(agent.name)
    setEditIcon(agent.icon)
  }
  
  const handleEditSave = (id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, name: editName, icon: editIcon } : a
    ))
    setEditingId(null)
  }

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
        我的展示 <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 'normal' }}>Agent管理</span>
      </h1>

      {/* 统计概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', padding: '1rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Agent总数</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{agents.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', padding: '1rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>已解锁成就</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{achievements.filter(a => a.unlocked).length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', padding: '1rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>进行中</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{achievements.filter(a => !a.unlocked && a.progress > 0).length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', padding: '1rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>算法题数</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>202</div>
        </div>
      </div>

      {/* Agent列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {agents.map(agent => {
          const stats = getAgentStats(agent.id)
          const todayAchievements = getTodayAchievements(agent.id)
          const isEditing = editingId === agent.id
          
          return (
            <div key={agent.id} style={{
              background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
              overflow: 'hidden', transition: 'all 0.2s'
            }}>
              <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* 头像 */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: `${agent.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', flexShrink: 0
                }}>
                  {isEditing ? editIcon : agent.icon}
                </div>
                
                {/* 信息 */}
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        placeholder="图标"
                        style={{ width: '50px', padding: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem', textAlign: 'center' }}
                      />
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="名称"
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      />
                      <button onClick={() => handleEditSave(agent.id)} style={{ padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        <Save size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem', color: '#1e293b' }}>{agent.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                          {agent.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{agent.description}</div>
                    </>
                  )}
                </div>
                
                {/* 统计 */}
                <div style={{ display: 'flex', gap: '1.5rem', marginRight: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{stats.unlocked}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>成就</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.inProgress}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>进行中</div>
                  </div>
                </div>
                
                {/* 编辑按钮 */}
                {!isEditing && (
                  <button onClick={() => handleEditStart(agent)} style={{
                    padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    color: '#64748b'
                  }}>
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              
              {/* 今日成就 */}
              {todayAchievements.length > 0 && (
                <div style={{ padding: '0.75rem 1.25rem', background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trophy size={12} /> 今日成就
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {todayAchievements.map((a, i) => (
                      <span key={i} style={{
                        fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', 
                        padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}>
                        {a.icon} {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          加载中...
        </div>
      )}
    </div>
  )
}
