// 练习记录页面 - 每日练习成果展示
import { useState, useEffect } from 'react'
import { Code, Trophy, Calendar, TrendingUp, CheckCircle, BookOpen, Clock, Target } from 'lucide-react'
import { fetchPracticeRecords, fetchRecentActivity, PracticeEntry } from '../api/local'

// 分类统计（保持不变）
const algorithmStats = [
  { category: '数组操作', count: 25, progress: 85 },
  { category: '字符串处理', count: 18, progress: 70 },
  { category: '动态规划', count: 15, progress: 60 },
  { category: '二叉树', count: 12, progress: 50 },
  { category: '回溯算法', count: 10, progress: 45 },
  { category: '图论', count: 8, progress: 35 },
]

export default function Practice() {
  const [practiceData, setPracticeData] = useState<any>({
    total: 196,
    today: [],
    stats: { algorithms: 196, projects: 14, streak: 8, hours: 42.5 }
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [practice, activity] = await Promise.all([
          fetchPracticeRecords(),
          fetchRecentActivity()
        ])
        setPracticeData(practice)
        setRecentActivity(activity)
      } catch (e) {
        console.log('Practice load error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const { total, today, stats } = practiceData

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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
        📝 练习记录
      </h1>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <Code size={16} /> 算法题
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.algorithms}</div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <BookOpen size={16} /> 项目
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.projects}</div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} /> 连续天数
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.streak}天</div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <Clock size={16} /> 练习时长
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.hours}小时</div>
        </div>
      </div>

      {/* 今日练习 */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#475569' }}>📅 今日练习</h3>
        {today && today.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {today.map((item: PracticeEntry, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ flex: 1, color: '#1e293b' }}>{item.algorithm}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>{item.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            暂无今日练习记录
          </div>
        )}
      </div>

      {/* 近期活动 */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#475569' }}>🔥 近期活动</h3>
        {recentActivity && recentActivity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentActivity.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderBottom: idx < recentActivity.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '60px' }}>
                  {new Date(item.ts).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                </span>
                <span style={{ color: '#1e293b', fontSize: '0.875rem' }}>{item.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            暂无活动记录
          </div>
        )}
      </div>

      {/* 分类统计 */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#475569' }}>📊 分类进度</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {algorithmStats.map(stat => (
            <div key={stat.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#475569' }}>{stat.category}</span>
                <span style={{ color: '#64748b' }}>{stat.count}题</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stat.progress}%`, background: '#3b82f6', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
