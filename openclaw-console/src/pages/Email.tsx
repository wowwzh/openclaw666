// 邮箱页面
import { useState } from 'react'
import { Mail, Inbox, Send, RefreshCw } from 'lucide-react'

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  time: string
  read: boolean
  folder: 'inbox' | 'sent'
}

const mockEmails: Email[] = [
  { id: '1', from: 'noreply@github.com', subject: 'Security alert', preview: 'We noticed a new login your account...', time: '10:30', read: false, folder: 'inbox' },
  { id: '2', from: 'team@notion.so', subject: 'Welcome to Notion', preview: 'Get started with Notion...', time: '昨天', read: true, folder: 'inbox' },
  { id: '3', from: 'hello@vercel.com', subject: 'Deploy successful', preview: 'Your deployment is live...', time: '昨天', read: true, folder: 'inbox' },
  { id: '4', from: 'me@gmail.com', subject: 'Project update', preview: 'Here is the weekly update...', time: '星期一', read: true, folder: 'sent' },
]

export function EmailPage() {
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox')
  const [isConfigured, setIsConfigured] = useState(false)
  
  const emails = mockEmails.filter(e => e.folder === folder)
  
  if (!isConfigured) {
    return (
      <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📧 邮箱</h1>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <Mail size={64} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#475569' }}>邮箱未配置</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>配置IMAP邮箱后，可以在此查看邮件</p>
          <button onClick={() => setIsConfigured(true)} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>去设置</button>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>📧 邮箱</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1rem' }}>
        {/* 侧边栏 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', height: 'fit-content' }}>
          <button onClick={() => setFolder('inbox')} style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '8px', background: folder === 'inbox' ? '#3b82f6' : 'transparent', color: folder === 'inbox' ? 'white' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Inbox size={18} /> 收件箱
          </button>
          <button onClick={() => setFolder('sent')} style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '8px', background: folder === 'sent' ? '#3b82f6' : 'transparent', color: folder === 'sent' ? 'white' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} /> 已发送
          </button>
          
          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <div style={{ marginBottom: '0.5rem' }}>📧 test@example.com</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> 已连接
            </div>
          </div>
        </div>
        
        {/* 邮件列表 */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>{folder === 'inbox' ? '收件箱' : '已发送'}</span>
            <button style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}><RefreshCw size={18} color="#64748b" /></button>
          </div>
          
          {emails.map(email => (
            <div key={email.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', background: email.read ? 'white' : '#f8fafc', borderLeft: email.read ? 'none' : '3px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: email.read ? '400' : '600', color: '#1e293b' }}>{email.from}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{email.time}</span>
              </div>
              <div style={{ fontWeight: email.read ? '400' : '500', color: '#1e293b', marginBottom: '0.25rem' }}>{email.subject}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.preview}</div>
            </div>
          ))}
          
          {emails.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>暂无邮件</div>
          )}
        </div>
      </div>
    </div>
  )
}
