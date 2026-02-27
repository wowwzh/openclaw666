// 成就系统 - 真实数据
import { useState, useEffect } from 'react'
import { Trophy, Star, Lock, Unlock, Gift, Target } from 'lucide-react'
import { fetchAchievements, Achievement } from '../api/achievements'

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'inProgress'>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await fetchAchievements()
        setAchievements(data)
      } catch (e) {
        console.error('Failed to load achievements:', e)
      } finally {
        setLoading(false)
      }
    }
    loadAchievements()
  }, [])
  
  const filtered = achievements.filter(a => {
    if (agentFilter !== 'all' && a.agentId !== agentFilter) return false
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'inProgress') return !a.unlocked && a.progress > 0
    return true
  })
  
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const inProgressCount = achievements.filter(a => !a.unlocked && a.progress > 0).length
  
  const handleClaim = (id: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === id && !a.unlocked && a.progress >= a.maxProgress) {
        alert(`🎉 领取成功！获得 ${a.reward}`)
        return { ...a, unlocked: true }
      }
      return a
    }))
  }
  
  if (loading) {
    return (
      <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div>加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* 头部统计 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', 
        padding: '1.5rem', borderRadius: '16px', color: 'white', marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Trophy size={32} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>成就中心</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Agent成长体系</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{unlockedCount}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>已解锁</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{inProgressCount}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>进行中</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{achievements.length}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>总成就</div>
          </div>
        </div>
      </div>
      
      {/* 筛选器 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'white', padding: '0.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {(['all', 'inProgress', 'unlocked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: filter === f ? '#3b82f6' : 'transparent',
                color: filter === f ? 'white' : '#64748b', fontSize: '0.875rem'
              }}
            >
              {f === 'all' ? '全部' : f === 'inProgress' ? '进行中' : '已解锁'}
            </button>
          ))}
        </div>
      </div>
      
      {/* 成就列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map(achievement => (
          <div
            key={achievement.id}
            style={{
              background: achievement.unlocked ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'white',
              padding: '1.25rem', borderRadius: '12px', 
              border: achievement.unlocked ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              opacity: achievement.progress > 0 ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
                opacity: achievement.progress > 0 ? 1 : 0.5
              }}>
                {achievement.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {achievement.name}
                  {achievement.unlocked ? <Unlock size={14} color="#10b981" /> : <Lock size={14} color="#94a3b8" />}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{achievement.description}</div>
              </div>
            </div>
            
            {/* 进度条 */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#64748b' }}>进度</span>
                <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                  {achievement.progress} / {achievement.maxProgress}
                </span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%`,
                  background: achievement.unlocked ? '#f59e0b' : '#3b82f6',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            
            {/* 奖励和领取 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Gift size={14} /> {achievement.reward}
              </div>
              {achievement.progress >= achievement.maxProgress && !achievement.unlocked && (
                <button
                  onClick={() => handleClaim(achievement.id)}
                  style={{
                    padding: '0.25rem 0.75rem', background: '#10b981', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem'
                  }}
                >
                  领取
                </button>
              )}
              {achievement.unlocked && (
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={12} /> 已解锁
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          暂无成就数据
        </div>
      )}
    </div>
  )
}
