// 快捷命令面板
import { useState } from 'react'
import { Search, Terminal, Zap, Clock, Calculator, BookText, ListTodo, Activity } from 'lucide-react'

interface Command {
  id: string
  name: string
  description: string
  icon: any
  action: string
  shortcut?: string
}

const commands: Command[] = [
  { id: '1', name: '搜索新闻', description: '搜索最新AI/科技新闻', icon: Search, action: 'search_news', shortcut: '/sn' },
  { id: '2', name: '天气查询', description: '查询当前天气', icon: Zap, action: 'weather', shortcut: '/wt' },
  { id: '3', name: '历史记录', description: '查看最近活动', icon: Clock, action: 'history', shortcut: '/hi' },
  { id: '4', name: '计算器', description: '快速计算', icon: Calculator, action: 'calc', shortcut: '/ca' },
  { id: '5', name: '写代码', description: '生成代码片段', icon: Terminal, action: 'code', shortcut: '/co' },
  { id: '6', name: '知识问答', description: '问答知识库', icon: BookText, action: 'qa', shortcut: '/qa' },
  { id: '7', name: '新建任务', description: '创建定时任务', icon: ListTodo, action: 'new_task' },
  { id: '8', name: '系统状态', description: '查看网关状态', icon: Activity, action: 'status' },
]

export function CommandPanel() {
  const [search, setSearch] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [showCalc, setShowCalc] = useState(false)
  const [calcInput, setCalcInput] = useState('')
  
  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.shortcut?.toLowerCase().includes(search.toLowerCase())
  )
  
  const handleCommand = (cmd: Command) => {
    if (cmd.action === 'calc') {
      setShowCalc(true)
    } else {
      setResult(`执行命令: ${cmd.name}`)
      setTimeout(() => setResult(null), 2000)
    }
  }
  
  const calculate = () => {
    try {
      // 安全验证：只允许数字和基本数学运算符
      const safeInput = calcInput.replace(/[^0-9+\-*/.()% ]/g, '')
      if (!safeInput.trim()) {
        setResult('请输入有效的计算表达式')
        return
      }
      // 使用 Function 构造函数替代 eval，更安全
      const safeEval = new Function('return ' + safeInput)
      const result = safeEval()
      if (typeof result !== 'number' || !isFinite(result)) {
        setResult('计算结果无效')
        return
      }
      setResult(result.toString())
    } catch {
      setResult('计算错误')
    }
  }
  
  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        快捷命令
      </h1>
      
      {/* 搜索框 */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索命令... (或输入 / 开头)"
          style={{
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 40px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
          }}
        />
      </div>
      
      {/* 命令网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {filteredCommands.map((cmd) => {
          const Icon = cmd.icon
          return (
            <button
              key={cmd.id}
              onClick={() => handleCommand(cmd)}
              style={{
                padding: '1.25rem',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={24} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{cmd.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cmd.description}</div>
              {cmd.shortcut && (
                <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: '0.5rem', background: '#eff6ff', padding: '0.125rem 0.375rem', borderRadius: '4px', display: 'inline-block' }}>
                  {cmd.shortcut}
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* 计算器 */}
      {showCalc && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600 }}>🧮 快速计算器</h3>
            <button onClick={() => setShowCalc(false)} style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>关闭</button>
          </div>
          <input
            value={calcInput}
            onChange={(e) => setCalcInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && calculate()}
            placeholder="输入计算表达式，如: 2+3*4"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1.1rem', fontFamily: 'monospace', marginBottom: '1rem' }}
          />
          <button onClick={calculate} style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>计算</button>
        </div>
      )}
      
      {/* 执行结果 */}
      {result && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: '#fff', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          ✅ {result}
        </div>
      )}
      
      {/* 快捷键提示 */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', marginTop: '1.5rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>⌨️ 常用快捷命令</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
            <span>/sn</span><span style={{ color: '#64748b' }}>搜索新闻</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
            <span>/wt</span><span style={{ color: '#64748b' }}>天气查询</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
            <span>/hi</span><span style={{ color: '#64748b' }}>历史记录</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
            <span>/ca</span><span style={{ color: '#64748b' }}>计算器</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPanel
