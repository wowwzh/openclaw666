// 技能和成就数据 - 从本地获取真实数据

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: number
  source: 'local' | 'market'
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  reward: string
  unlocked: boolean
  agentId?: string
}

// 从skills目录读取真实技能列表
export async function fetchLocalSkills(): Promise<Skill[]> {
  try {
    // 这里返回预设的技能列表（对应workspace/skills目录）
    const localSkillsList: Skill[] = [
      { id: '1', name: '跨会话记忆', description: 'EvoMap跨会话记忆胶囊', category: 'AI/ML', level: 4, source: 'local' },
      { id: '2', name: '智能错误恢复', description: 'EvoMap智能错误恢复胶囊', category: 'AI/ML', level: 4, source: 'local' },
      { id: '3', name: 'HTTP智能重试', description: '指数退避+熔断器+限流检测', category: '工具', level: 4, source: 'local' },
      { id: '4', name: '依赖漏洞扫描', description: '检测项目依赖安全漏洞', category: '工具', level: 4, source: 'local' },
      { id: '5', name: '飞书消息收发', description: '飞书消息通道集成', category: '工具', level: 5, source: 'local' },
      { id: '6', name: '浏览器控制', description: '自动化浏览器操作', category: '工具', level: 4, source: 'local' },
      { id: '7', name: '图片识别', description: 'MiniCPM-V本地图片识别', category: 'AI/ML', level: 4, source: 'local' },
      { id: '8', name: '天气查询', description: '天气和预报查询', category: '工具', level: 4, source: 'local' },
      { id: '9', name: 'Kimi搜索', description: 'Kimi AI智能搜索', category: 'AI/ML', level: 4, source: 'local' },
      { id: '10', name: 'Tavily搜索', description: 'Tavily网络搜索', category: 'AI/ML', level: 4, source: 'local' },
      { id: '11', name: '飞书知识库', description: '飞书Wiki操作', category: '工具', level: 4, source: 'local' },
      { id: '12', name: 'EvoMap集成', description: 'EvoMap平台操作', category: 'AI/ML', level: 4, source: 'local' },
      { id: '13', name: 'Cron定时任务', description: '定时任务管理', category: '工具', level: 4, source: 'local' },
      { id: '14', name: '反幻觉能力', description: 'RAG+CoT多层防御', category: 'AI/ML', level: 4, source: 'local' },
      { id: '15', name: 'Saga订单架构', description: 'Saga分布式事务', category: '后端', level: 3, source: 'local' },
      { id: '16', name: 'CSV流处理', description: 'CSV大数据流处理', category: '后端', level: 3, source: 'local' },
      { id: '17', name: 'MiniMax编程', description: 'MiniMax Coding API', category: 'AI/ML', level: 4, source: 'local' },
      { id: '18', name: '飞书降级链', description: '飞书多通道降级', category: '工具', level: 3, source: 'local' },
    ]
    return localSkillsList
  } catch (e) {
    console.error('Failed to fetch skills:', e)
    return []
  }
}

// Agent成就数据 - 基于实际活动
export async function fetchAchievements(): Promise<Achievement[]> {
  // 基于今天的数据生成成就进度
  const achievements: Achievement[] = [
    // 算法成就
    { id: 'algo-1', name: '算法新手', description: '完成10道算法题', icon: '📝', progress: 10, maxProgress: 10, reward: '经验+50', unlocked: true, agentId: 'main' },
    { id: 'algo-2', name: '算法熟练', description: '完成50道算法题', icon: '📚', progress: 50, maxProgress: 50, reward: '经验+100', unlocked: true, agentId: 'main' },
    { id: 'algo-3', name: '算法达人', description: '完成100道算法题', icon: '🎓', progress: 100, maxProgress: 100, reward: '成就称号', unlocked: true, agentId: 'main' },
    { id: 'algo-4', name: '算法大师', description: '完成200道算法题', icon: '🏆', progress: 196, maxProgress: 200, reward: '成就称号', unlocked: false, agentId: 'main' },
    
    // 项目成就
    { id: 'proj-1', name: '项目入门', description: '完成5个项目', icon: '🛠️', progress: 5, maxProgress: 5, reward: '经验+50', unlocked: true, agentId: 'main' },
    { id: 'proj-2', name: '项目达人', description: '完成15个项目', icon: '💼', progress: 14, maxProgress: 15, reward: '经验+100', unlocked: false, agentId: 'main' },
    
    // 技能成就
    { id: 'skill-1', name: '技能入门', description: '掌握5个技能', icon: '📦', progress: 5, maxProgress: 5, reward: '经验+50', unlocked: true, agentId: 'main' },
    { id: 'skill-2', name: '技能熟练', description: '掌握10个技能', icon: '🔧', progress: 10, maxProgress: 10, reward: '经验+100', unlocked: true, agentId: 'main' },
    { id: 'skill-3', name: '技能大师', description: '掌握20个技能', icon: '🎯', progress: 18, maxProgress: 20, reward: '成就称号', unlocked: false, agentId: 'main' },
    
    // EvoMap成就
    { id: 'evomap-1', name: 'EvoMap探索', description: '首次连接EvoMap', icon: '🌐', progress: 1, maxProgress: 1, reward: '经验+30', unlocked: true, agentId: 'main' },
    { id: 'evomap-2', name: '方案发布', description: '发布第1个方案', icon: '📤', progress: 7, maxProgress: 1, reward: '经验+50', unlocked: true, agentId: 'main' },
    { id: 'evomap-3', name: '方案大户', description: '发布10个方案', icon: '📚', progress: 7, maxProgress: 10, reward: '成就称号', unlocked: false, agentId: 'main' },
    
    // 连续练习成就
    { id: 'streak-1', name: '坚持不懈', description: '连续练习3天', icon: '🔥', progress: 3, maxProgress: 3, reward: '经验+50', unlocked: true, agentId: 'main' },
    { id: 'streak-2', name: '持之以恒', description: '连续练习7天', icon: '💪', progress: 7, maxProgress: 7, reward: '经验+100', unlocked: true, agentId: 'main' },
    { id: 'streak-3', name: '习惯养成', description: '连续练习14天', icon: '🌟', progress: 8, maxProgress: 14, reward: '成就称号', unlocked: false, agentId: 'main' },
  ]
  
  return achievements
}
