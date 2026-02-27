// 日志读取API - 通过代理fetch读取
// 由于浏览器不能直接读文件，需要通过Gateway的API或创建简单的代理

export interface LogEntry {
  ts: string
  source: string
  event: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
}

export interface PracticeEntry {
  date: string
  algorithm: string
  type: string
  status: string
}

// 通过fetch从本地HTTP服务器读取（如果有的话）
// 或者使用模拟数据+实际Gateway数据

// 模拟日志数据（当没有真实API时使用）
const mockLogs: LogEntry[] = [
  { ts: new Date().toISOString(), source: 'gateway', event: 'system', message: 'Gateway启动成功', type: 'success' },
  { ts: new Date(Date.now() - 60000).toISOString(), source: 'feishu', event: 'message', message: '收到新消息', type: 'info' },
  { ts: new Date(Date.now() - 120000).toISOString(), source: 'cron', event: 'task', message: '定时任务执行完成', type: 'success' },
  { ts: new Date(Date.now() - 180000).toISOString(), source: 'evolver', event: 'publish', message: '发布资产成功', type: 'success' },
  { ts: new Date(Date.now() - 300000).toISOString(), source: 'gateway', event: 'config', message: '配置已更新', type: 'info' },
]

// 模拟练习数据
const mockPractice = {
  total: 196,
  today: [
    { date: new Date().toISOString().split('T')[0], algorithm: '课程表 II', type: '算法', status: 'completed' },
    { date: new Date().toISOString().split('T')[0], algorithm: '字符串解码', type: '算法', status: 'completed' },
    { date: new Date().toISOString().split('T')[0], algorithm: '打家劫舍 II', type: '算法', status: 'completed' },
  ],
  stats: { algorithms: 196, projects: 14, streak: 8, hours: 42.5 }
}

// 读取日志
export async function fetchLocalLogs(limit: number = 50): Promise<LogEntry[]> {
  // TODO: 后续可以通过Gateway API读取真实日志
  // 目前返回模拟数据+真实Gateway事件
  try {
    // 尝试从gateway获取一些真实事件
    const gwStatus = await fetch('http://localhost:18789/status').then(r => r.json()).catch(() => null)
    
    if (gwStatus) {
      // 添加真实Gateway状态
      return [
        { ts: new Date().toISOString(), source: 'gateway', event: 'status', message: `会话: ${gwStatus.sessions || 0}`, type: 'info' },
        ...mockLogs.slice(0, limit - 1)
      ]
    }
  } catch (e) {
    // Gateway没响应，返回模拟数据
  }
  
  return mockLogs.slice(0, limit)
}

// 读取练习记录
export async function fetchPracticeRecords(): Promise<{ total: number, today: PracticeEntry[], stats: any }> {
  // TODO: 后续可以从本地文件读取
  // 目前使用模拟数据+一些真实数据
  
  // 尝试获取今日算法题数量
  try {
    // 这里可以后续接入真实数据
  } catch (e) {
    console.log('Using mock practice data')
  }
  
  return mockPractice
}

// 读取近期活动
export async function fetchRecentActivity(limit: number = 20): Promise<LogEntry[]> {
  return mockLogs.slice(0, limit)
}
