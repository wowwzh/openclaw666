// AI产品知识库页面
import { useState } from 'react'
import { BookOpen, Search, ArrowRight, Lightbulb, Target, Layout, Users, Sparkles } from 'lucide-react'

const knowledgeCards = [
  {
    id: 'ai-pm',
    title: 'AI产品经理转型',
    icon: Target,
    color: '#8b5cf6',
    tags: ['转型', '技能', 'AI'],
    summary: 'AI产品经理需要兼具产品专业技能+行业/业务知识+AI技术理解力',
    keyPoints: [
      '第一阶段(1-2月)：产品建设能力 + 行业业务洞察',
      '第二阶段(3月)：技术理解力 + AI项目落地经验',
      '核心：积累1-3个真实AI项目经验',
      '成功要素：产品思维 + 业务认知 + 技术基础'
    ]
  },
  {
    id: 'b-form',
    title: 'B端表单设计趋势',
    icon: Layout,
    color: '#10b981',
    tags: ['B端', '表单', 'UX'],
    summary: '2026年步骤条从"标配"走向"退场"，长表单+锚点导航成为新趋势',
    keyPoints: [
      '步骤条问题：全局感缺失、录入流中断、修改成本高',
      '新模式：长表单 + 锚点导航',
      '决策法则：有依赖用步骤条，高频编辑用单页',
      '本质：把业务掌控权交还给专家型用户'
    ]
  },
  {
    id: 'ui-2026',
    title: '2026 UI设计趋势',
    icon: Sparkles,
    color: '#f59e0b',
    tags: ['UI', '设计', '趋势'],
    summary: '根据用户需求与场景合理选择风格，适配性成为设计核心',
    keyPoints: [
      '触觉3D感：数字元素物理质感',
      '动态排版：文字响应用户操作',
      '杂志质感：柔和光影、低饱和度',
      '手势交互：滑动拖拽取代按钮'
    ]
  },
  {
    id: 'hitl',
    title: 'AIGC人机协作',
    icon: Users,
    color: '#ef4444',
    tags: ['AI', '人机协作', '效率'],
    summary: '用"HITL人机协作"工作法+三道人工闸门，在效率与质量间找到黄金平衡点',
    keyPoints: [
      '三道闸门：Input层→Process层→Output层',
      '人机协作率：资料综述70-85%，观点评论40-60%',
      '核心：AI是增幅器，不是替代者',
      '发布礼仪：许可说明→PR对→人工摘要'
    ]
  }
]

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredCards = knowledgeCards.filter(card =>
    card.title.includes(searchTerm) ||
    card.tags.some(tag => tag.includes(searchTerm)) ||
    card.summary.includes(searchTerm)
  )

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} />
          AI产品知识库
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          收录产品设计核心知识，持续更新...
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="搜索知识卡片..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredCards.map(card => {
          const Icon = card.icon
          const isExpanded = expandedId === card.id
          
          return (
            <div
              key={card.id}
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isExpanded ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} color={card.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{card.title}</h3>
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {card.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '0.7rem',
                          padding: '0.125rem 0.5rem',
                          background: '#f1f5f9',
                          borderRadius: '4px',
                          color: '#64748b'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} color="#94a3b8" style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }} />
              </div>

              {/* Summary */}
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginTop: '1rem',
                lineHeight: '1.5'
              }}>
                {card.summary}
              </p>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Lightbulb size={16} color="#f59e0b" />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>核心要点</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    {card.keyPoints.map((point, idx) => (
                      <li key={idx} style={{
                        fontSize: '0.8rem',
                        color: '#475569',
                        marginBottom: '0.5rem',
                        lineHeight: '1.4'
                      }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#94a3b8'
        }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>暂无匹配的知识点</p>
        </div>
      )}
    </div>
  )
}
