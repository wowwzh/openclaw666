// 增强版设置页面 - Agent自身设置
import { useState } from 'react'
import { useAppStore } from '../store'
import { Settings, Key, MessageSquare, Shield, User, Bell, Save, Monitor, Mail } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

export function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const [activeTab, setActiveTab] = useState('agent')
  const [saving, setSaving] = useState(false)
  
  // Gateway Token 状态
  const [gatewayToken, setGatewayToken] = useState(() => localStorage.getItem('gateway_token') || '')
  
// Agent个性化设置 - 持久化到store
  const [agentName, setAgentName] = useState(settings.agentName || '沈幼楚')
  const [agentPersonality, setAgentPersonality] = useState(settings.agentPersonality || '活泼可爱、勤奋好学')
  const [greeting, setGreeting] = useState(settings.greeting || '你好！我是沈幼楚，有什么可以帮你的吗？')
  
  const tabs = [
    { id: 'agent', name: 'Agent设置', icon: User },
    { id: 'email', name: '邮箱配置', icon: Mail },
    { id: 'window', name: '窗口设置', icon: Monitor },
    { id: 'model', name: '模型配置', icon: Settings },
    { id: 'channels', name: '消息通道', icon: MessageSquare },
    { id: 'notify', name: '通知设置', icon: Bell },
    { id: 'api', name: 'API配置', icon: Key },
    { id: 'security', name: '安全设置', icon: Shield },
  ]
  
  const handleSave = () => {
    setSaving(true)
    // 保存 Gateway Token 到 localStorage
    localStorage.setItem('gateway_token', gatewayToken)
    setTimeout(() => {
      setSaving(false)
      toast.success('设置已保存!')
    }, 500)
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'agent':
        return (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>🤖 Agent 自身设置</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Agent名称</label>
              <input 
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="例如: 沈幼楚"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>性格设定</label>
              <input 
                value={agentPersonality}
                onChange={(e) => setAgentPersonality(e.target.value)}
                placeholder="例如: 活泼可爱、勤奋好学"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>开场问候语</label>
              <textarea 
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>语言/时区</label>
              <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option>中文 (GMT+8)</option>
                <option>English (GMT+0)</option>
                <option>日本語 (GMT+9)</option>
              </select>
            </div>
          </div>
        )
        
      case 'model':
        return (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>⚙️ 模型配置</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>默认对话模型</label>
              <select 
                value={settings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option>MiniMax-M2.5</option>
                <option>MiniMax-M2.1</option>
                <option>MiniMax-Lightning</option>
                <option>MiniMax-Text-01</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>思考模式</label>
              <select 
                value={settings.thinking}
                onChange={(e) => updateSettings({ thinking: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option>关闭</option>
                <option>快速思考</option>
                <option>深度思考</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>温度参数 (0-1)</label>
              <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" style={{ width: '100%' }} />
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>值越高回复越有创意，越低越稳定</div>
            </div>
          </div>
        )
        
      case 'channels':
        return (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>💬 消息通道</h3>
            {[
              { key: 'feishu', name: '飞书', status: '已连接', connected: settings.channels.feishu, icon: '📱' },
              { key: 'telegram', name: 'Telegram', status: '未连接', connected: settings.channels.telegram, icon: '✈️' },
              { key: 'discord', name: 'Discord', status: '未连接', connected: settings.channels.discord, icon: '🎮' },
            ].map((ch) => (
              <div key={ch.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{ch.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{ch.name}</div>
                    <div style={{ fontSize: '0.875rem', color: ch.connected ? '#10b981' : '#94a3b8' }}>{ch.status}</div>
                  </div>
                </div>
                <label style={{ position: 'relative', width: '50px', height: '26px' }}>
                  <input type="checkbox" checked={settings.channels[ch.key as keyof typeof settings.channels]} onChange={(e) => updateSettings({ channels: { ...settings.channels, [ch.key]: e.target.checked } })} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings.channels[ch.key as keyof typeof settings.channels] ? '#10b981' : '#e2e8f0', borderRadius: '26px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '20px', width: '20px', left: settings.channels[ch.key as keyof typeof settings.channels] ? '27px' : '3px', bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )
        
      case 'notify':
        return (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>🔔 通知设置</h3>
            {[
              { label: '定时任务完成通知', desc: '任务执行完成后推送通知', default: true },
              { label: '学习成果汇报', desc: '每日学习进度汇报', default: true },
              { label: '错误告警', desc: '系统异常时及时通知', default: true },
              { label: 'EvoMap动态', desc: '有新方案上架时通知', default: false },
              { label: '天气提醒', desc: '恶劣天气提前提醒', default: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</div>
                </div>
                <label style={{ position: 'relative', width: '50px', height: '26px' }}>
                  <input type="checkbox" defaultChecked={item.default} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: item.default ? '#10b981' : '#e2e8f0', borderRadius: '26px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '20px', width: '20px', left: item.default ? '27px' : '3px', bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )
        
      case 'window':
          return (
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>🪟 窗口设置</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                  <span>记住窗口大小和位置</span>
                </label>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>退出时自动保存窗口状态，下次启动时恢复</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                  <span>启动时最大化窗口</span>
                </label>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                  <span>显示最小化到系统托盘</span>
                </label>
              </div>
            </div>
          )
        
      case 'api':
        return (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>🔑 API配置</h3>
            
            {/* Gateway Token - 新增 */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#0369a1' }}>
                🔐 Gateway Token
                <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{gatewayToken ? '✓ 已配置' : '⚠️ 必填'}</span>
              </label>
              <input 
                type="password"
                value={gatewayToken}
                onChange={(e) => setGatewayToken(e.target.value)}
                placeholder="输入 Gateway API Token"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                用于访问 Gateway API（系统状态、频道统计等功能）
              </p>
            </div>
            
            {[
              { label: 'MiniMax API Key', key: 'minimax', status: '✓ 已配置', placeholder: 'sk-xxxx...' },
              { label: 'Tavily API Key', key: 'tavily', status: '未配置', placeholder: 'tvly-xxxx...' },
              { label: 'FAL.ai API Key', key: 'fal', status: '可选', placeholder: '用于图像生成...' },
              { label: 'EvoMap API Key', key: 'evomap', status: '未配置', placeholder: 'EVM-FREE-xxxx...' },
            ].map((api) => (
              <div key={api.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {api.label}
                  <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{api.status}</span>
                </label>
                <input 
                  type="password"
                  placeholder={api.placeholder}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            ))}
          </div>
        )
        
      case 'security':
        return (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>🛡️ 安全设置</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>IP白名单</label>
              <textarea placeholder="每行一个IP地址... (空则不限制)" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Webhook验证密钥</label>
              <input type="password" placeholder="可选，用于验证请求来源..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>访问密码</label>
              <input type="password" placeholder="设置访问密码保护客户端" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
          </div>
        )
    }
  }
  
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Toaster position="top-right" />
      
      <div style={{ width: '200px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '1rem 0', overflow: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: isActive ? '#eff6ff' : 'transparent',
                border: 'none', borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent', color: isActive ? '#2563eb' : '#64748b', cursor: 'pointer', textAlign: 'left' }}>
              <Icon size={18} />
              {tab.name}
            </button>
          )
        })}
      </div>
      
      <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tabs.find(t => t.id === activeTab)?.name}</h1>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: saving ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}
