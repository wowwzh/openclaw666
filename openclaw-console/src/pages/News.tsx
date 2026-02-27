// 资讯页面 - 新闻+天气+知识库
import { useState } from 'react'
import { Cloud, CloudRain, Sun, Cloudy, FileText, BookOpen, ExternalLink, RefreshCw, Search, Tag } from 'lucide-react'
import { useKnowledge, KnowledgeEntry } from '../api/knowledge'

export function News() {
  const [tab, setTab] = useState<'news' | 'weather' | 'knowledge'>('knowledge')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const { entries, categories } = useKnowledge()
  
  // 天气模拟数据
  const weatherData = {
    location: '南宁',
    temp: 18,
    condition: '多云',
    humidity: 65,
    wind: 12,
    aqi: '良',
    forecast: [
      { day: '今天', high: 18, low: 14, condition: '多云' },
      { day: '明天', high: 20, low: 15, condition: '晴' },
      { day: '后天', high: 22, low: 16, condition: '晴' },
    ]
  }
  
  // 新闻模拟数据
  const newsData = [
    { id: 1, title: 'Anthropic推出智能体AI工具', source: '科技新闻', time: '今天', summary: '缓解AI之忧，美股大反弹', category: 'AI' },
    { id: 2, title: 'Stripe估值跃升至1590亿美元', source: '商业', time: '今天', summary: '支付巨头估值创新高', category: '商业' },
    { id: 3, title: 'AMD与Meta达成芯片供应协议', source: '硬件', time: '昨天', summary: '第二份超大型芯片供应协议', category: '硬件' },
    { id: 4, title: '6G冲刺万亿赛道', source: '通信', time: '昨天', summary: '从愿景到实景', category: '通信' },
  ]
  
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case '晴': return <Sun size={48} color="#f59e0b" />
      case '多云': return <Cloudy size={48} color="#64748b" />
      case '雨': return <CloudRain size={48} color="#3b82f6" />
      default: return <Cloud size={48} color="#64748b" />
    }
  }
  
  // 过滤知识库
  const filteredKnowledge = entries.filter(e => {
    const matchSearch = !search || e.title.includes(search) || e.summary.includes(search)
    const matchCategory = category === '全部' || e.category === category
    return matchSearch && matchCategory
  })

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* 标签切换 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'knowledge', label: '知识库', icon: BookOpen },
          { id: 'news', label: '新闻', icon: FileText },
          { id: 'weather', label: '天气', icon: Cloud },
        ].map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                background: tab === t.id ? '#3b82f6' : 'white',
                color: tab === t.id ? 'white' : '#64748b',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>
      
      {/* 知识库 */}
      {tab === 'knowledge' && (
        <>
          {/* 搜索和筛选 */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="搜索知识库..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
              />
            </div>
          </div>
          
          {/* 分类标签 */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{
                  padding: '0.25rem 0.75rem', borderRadius: '20px', border: 'none',
                  background: category === cat ? '#3b82f6' : '#f1f5f9',
                  color: category === cat ? 'white' : '#64748b',
                  cursor: 'pointer', fontSize: '0.75rem'
                }}>
                {cat}
              </button>
            ))}
          </div>
          
          {/* 知识库列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredKnowledge.map(item => (
              <div key={item.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{item.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.date}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>{item.summary}</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {item.category}
                  </span>
                  {item.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: 'auto' }}>{item.source}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredKnowledge.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>没有找到相关知识</div>
          )}
        </>
      )}
      
      {/* 新闻 */}
      {tab === 'news' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {newsData.map(item => (
            <div key={item.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{item.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.time}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>{item.summary}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{item.source}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 天气 */}
      {tab === 'weather' && (
        <div>
          {/* 当前天气 */}
          <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{weatherData.location}</div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{weatherData.temp}°C</div>
                <div style={{ opacity: 0.9 }}>{weatherData.condition}</div>
              </div>
              {getWeatherIcon(weatherData.condition)}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>湿度</div>
                <div style={{ fontWeight: '600' }}>{weatherData.humidity}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>风速</div>
                <div style={{ fontWeight: '600' }}>{weatherData.wind}km/h</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>AQI</div>
                <div style={{ fontWeight: '600' }}>{weatherData.aqi}</div>
              </div>
            </div>
          </div>
          
          {/* 预报 */}
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>预报</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {weatherData.forecast.map((day, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{day.day}</div>
                  {getWeatherIcon(day.condition)}
                  <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>{day.high}° / {day.low}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default News
