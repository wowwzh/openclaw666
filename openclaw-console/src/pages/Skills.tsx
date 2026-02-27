// 技能市场页面 - 真实数据
import { useState, useEffect } from 'react'
import { Search, Star, Package, Trophy, Zap, Shield, Code, Database, Brain } from 'lucide-react'
import { fetchLocalSkills, Skill } from '../api/achievements'

const categoryIcons: Record<string, any> = {
  'AI/ML': Brain,
  '前端': Code,
  '后端': Database,
  '工具': Shield,
}

const categoryColors: Record<string, string> = {
  'AI/ML': '#8b5cf6',
  '前端': '#3b82f6',
  '后端': '#10b981',
  '工具': '#f59e0b',
}

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [view, setView] = useState<'local' | 'market'>('local')
  
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await fetchLocalSkills()
        setSkills(data)
      } catch (e) {
        console.error('Failed to load skills:', e)
      } finally {
        setLoading(false)
      }
    }
    loadSkills()
  }, [])
  
  const categories = ['all', 'AI/ML', '前端', '后端', '工具']
  const filteredSkills = skills.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                       s.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || s.category === category
    return matchSearch && matchCategory
  })
  
  const levelColors = ['#94a3b8', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']
  
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>🌲 技能中心</h1>
      
      {/* 搜索和筛选 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="搜索技能..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap',
                background: category === cat ? '#3b82f6' : 'white',
                color: category === cat ? 'white' : '#64748b'
              }}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* 技能统计 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>本地技能</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{skills.length}</div>
        </div>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>AI/ML</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{skills.filter(s => s.category === 'AI/ML').length}</div>
        </div>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>工具</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{skills.filter(s => s.category === '工具').length}</div>
        </div>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, minWidth: '150px' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>平均等级</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {(skills.reduce((a, b) => a + b.level, 0) / skills.length).toFixed(1)}
          </div>
        </div>
      </div>
      
      {/* 技能列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredSkills.map(skill => {
          const Icon = categoryIcons[skill.category] || Shield
          const color = categoryColors[skill.category] || '#64748b'
          
          return (
            <div
              key={skill.id}
              style={{
                background: 'white', padding: '1.25rem', borderRadius: '12px',
                border: '1px solid #e2e8f0', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={24} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: `${color}15`, color, padding: '2px 6px', borderRadius: '4px' }}>
                      {skill.category}
                    </span>
                    <span style={{ color: '#94a3b8' }}>{skill.source}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                {skill.description}
              </div>
              
              {/* 等级 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} color={levelColors[skill.level]} />
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      style={{
                        width: '16px', height: '6px', borderRadius: '3px',
                        background: i <= skill.level ? levelColors[skill.level] : '#e2e8f0'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem' }}>
                  Lv.{skill.level}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredSkills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          没有找到匹配的技能
        </div>
      )}
    </div>
  )
}
