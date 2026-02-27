// 定时任务管理页面 - 可展开/编辑
import { useState, useEffect } from 'react'
import { useAppStore } from '../store'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Play, Pause, Save, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

export function Tasks() {
  const { tasks, toggleTask, addTask, updateTask, deleteTask, fetchTasksFromApi } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', schedule: '' })
  
  // 加载真实任务数据
  useEffect(() => {
    fetchTasksFromApi()
  }, [])
  
  const getStatusIcon = (status?: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return <CheckCircle size={14} color="#10b981" />
      case 'error': return <XCircle size={14} color="#ef4444" />
      case 'pending': return <AlertCircle size={14} color="#f59e0b" />
      default: return null
    }
  }
  
  const handleEdit = (task: typeof tasks[0]) => {
    setEditingId(task.id)
    setEditForm({ name: task.name, description: task.description, schedule: task.schedule })
  }
  
  const handleSave = (id: string) => {
    updateTask(id, editForm)
    setEditingId(null)
    toast.success('任务已更新!')
  }
  
  const handleAdd = () => {
    if (!editForm.name || !editForm.schedule) {
      toast.error('请填写任务名称和时间表达式!')
      return
    }
    addTask({
      id: Date.now().toString(),
      ...editForm,
      status: 'active',
      nextRun: '即将执行',
    })
    setShowAdd(false)
    setEditForm({ name: '', description: '', schedule: '' })
    toast.success('新任务已添加!')
  }
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗?')) {
      deleteTask(id)
      toast.success('任务已删除')
    }
  }
  
  return (
    <div style={{ padding: '1.5rem' }}>
      <Toaster position="top-right" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          定时任务管理
          <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem' }}>
            ({tasks.filter(t => t.status === 'active').length}个运行中)
          </span>
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          添加任务
        </button>
      </div>
      
      {/* 添加任务表单 */}
      {showAdd && (
        <div style={{
          background: '#fff',
          padding: '1.25rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
          border: '2px solid #2563eb',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>添加新任务</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>任务名称 *</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="例如: 早间汇报"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>Cron表达式 *</label>
              <input
                value={editForm.schedule}
                onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                placeholder="例如: 0 8 * * *"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>任务描述</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="描述这个任务做什么..."
              rows={2}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAdd} style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              <Save size={16} style={{ marginRight: '4px' }} /> 保存
            </button>
            <button onClick={() => { setShowAdd(false); setEditForm({ name: '', description: '', schedule: '' }) }} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              <X size={16} style={{ marginRight: '4px' }} /> 取消
            </button>
          </div>
        </div>
      )}
      
      {/* 任务列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* 任务头部 */}
            <div
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: task.status === 'active' ? '#fff' : '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {getStatusIcon(task.lastStatus)}
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {task.name}
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      fontSize: '0.7rem',
                      background: task.status === 'active' ? '#dcfce7' : '#f1f5f9',
                      color: task.status === 'active' ? '#16a34a' : '#64748b',
                      borderRadius: '4px',
                    }}>
                      {task.status === 'active' ? '运行中' : '已停止'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={12} />
                    下次执行: {task.nextRun}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id) }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    background: task.status === 'active' ? '#fee2e2' : '#dcfce7',
                    color: task.status === 'active' ? '#dc2626' : '#16a34a',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {task.status === 'active' ? <Pause size={14} style={{ marginRight: '4px' }} /> : <Play size={14} style={{ marginRight: '4px' }} />}
                  {task.status === 'active' ? '停止' : '启动'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(task) }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    background: '#e0e7ff',
                    color: '#4f46e5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={14} style={{ marginRight: '4px' }} /> 编辑
                </button>
                {expandedId === task.id ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
              </div>
            </div>
            
            {/* 展开详情 */}
            {expandedId === task.id && (
              <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                {editingId === task.id ? (
                  /* 编辑表单 */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>任务名称</label>
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>Cron表达式</label>
                        <input
                          value={editForm.schedule}
                          onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>任务描述</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={2}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleSave(task.id)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        保存修改
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        取消
                      </button>
                      <button onClick={() => handleDelete(task.id)} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
                        <Trash2 size={14} style={{ marginRight: '4px' }} /> 删除
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 只读详情 */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>任务描述</div>
                      <div style={{ fontSize: '0.9rem' }}>{task.description || '无描述'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>执行计划</div>
                      <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{task.schedule}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>上次执行</div>
                      <div style={{ fontSize: '0.9rem' }}>{task.lastRun || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>上次状态</div>
                      <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {getStatusIcon(task.lastStatus)}
                        {task.lastStatus === 'success' && '成功'}
                        {task.lastStatus === 'error' && '失败'}
                        {task.lastStatus === 'pending' && '执行中'}
                        {!task.lastStatus && '-'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
