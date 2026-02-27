// ============================================
// 技能状态管理
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Skill } from './types'

interface SkillsState {
  skills: Skill[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  updateSkill: (id: string, updates: Partial<Skill>) => void
  deleteSkill: (id: string) => void
  toggleSkill: (id: string) => void
  updateSkillLevel: (id: string, level: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set) => ({
      // 默认技能
      skills: [
        // AI/ML
        { id: 'llm', name: 'LLM调用', category: 'AI/ML', level: 4, description: '大语言模型调用', source: 'local', enabled: true },
        { id: 'rag', name: 'RAG', category: 'AI/ML', level: 3, description: '检索增强生成', source: 'local', enabled: true },
        { id: 'prompt', name: 'Prompt工程', category: 'AI/ML', level: 4, description: '提示词优化', source: 'local', enabled: true },
        { id: 'agent', name: 'Agent设计', category: 'AI/ML', level: 3, description: '智能体开发', source: 'local', enabled: true },
        { id: 'a2a', name: 'A2A协议', category: 'AI/ML', level: 2, description: 'Agent间通信协议', source: 'local', enabled: true },
        { id: 'mcp', name: 'MCP协议', category: 'AI/ML', level: 2, description: '模型上下文协议', source: 'local', enabled: true },
        
        // 前端
        { id: 'react', name: 'React', category: '前端', level: 3, description: 'React框架', source: 'local', enabled: true },
        { id: 'vue', name: 'Vue', category: '前端', level: 3, description: 'Vue框架', source: 'local', enabled: true },
        { id: 'typescript', name: 'TypeScript', category: '前端', level: 3, description: '类型系统', source: 'local', enabled: true },
        { id: 'css', name: 'CSS布局', category: '前端', level: 3, description: 'Flexbox/Grid', source: 'local', enabled: true },
        
        // 后端
        { id: 'node', name: 'Node.js', category: '后端', level: 3, description: '后端开发', source: 'local', enabled: true },
        { id: 'python', name: 'Python', category: '后端', level: 3, description: '后端开发', source: 'local', enabled: true },
        { id: 'fastapi', name: 'FastAPI', category: '后端', level: 3, description: 'Python框架', source: 'local', enabled: true },
        { id: 'docker', name: 'Docker', category: '后端', level: 3, description: '容器化', source: 'local', enabled: true },
        { id: 'mysql', name: 'MySQL', category: '后端', level: 3, description: '数据库', source: 'local', enabled: true },
        { id: 'redis', name: 'Redis', category: '后端', level: 3, description: '缓存', source: 'local', enabled: true },
        
        // 工具
        { id: 'feishu', name: '飞书集成', category: '工具', level: 4, description: '消息推送', source: 'local', enabled: true },
        { id: 'browser', name: '浏览器控制', category: '工具', level: 4, description: '自动化', source: 'local', enabled: true },
        { id: 'search', name: '搜索工具', category: '工具', level: 4, description: '网络搜索', source: 'local', enabled: true },
        { id: 'image', name: '图像识别', category: '工具', level: 4, description: '视觉理解', source: 'local', enabled: true },
        
        // 市场示例
        { id: 'market-1', name: 'EvoMap工具', category: 'AI/ML', level: 0, description: 'EvoMap平台集成', source: 'market', author: 'EvoMap', stars: 95, enabled: false },
        { id: 'market-2', name: '代码审查', category: '开发', level: 0, description: '自动化代码审查工具', source: 'market', author: 'CodeReview', stars: 88, enabled: false },
        { id: 'market-3', name: 'API测试', category: '开发', level: 0, description: 'REST API测试工具', source: 'market', author: 'APITest', stars: 82, enabled: false },
        { id: 'market-4', name: '数据库管理', category: '后端', level: 0, description: '可视化数据库管理', source: 'market', author: 'DBMaster', stars: 79, enabled: false },
        { id: 'market-5', name: 'UI测试', category: '前端', level: 0, description: '前端UI自动化测试', source: 'market', author: 'UITest', stars: 75, enabled: false },
      ],
      isLoading: false,
      error: null,

      setSkills: (skills) => set({ skills }),
      
      addSkill: (skill) => set((state) => ({ 
        skills: [...state.skills, skill] 
      })),
      
      updateSkill: (id, updates) => set((state) => ({ 
        skills: state.skills.map(s => s.id === id ? { ...s, ...updates } : s) 
      })),
      
      deleteSkill: (id) => set((state) => ({ 
        skills: state.skills.filter(s => s.id !== id) 
      })),
      
      toggleSkill: (id) => set((state) => ({ 
        skills: state.skills.map(s => s.id === id 
          ? { ...s, enabled: !s.enabled } 
          : s
        ) 
      })),
      
      updateSkillLevel: (id, level) => set((state) => ({ 
        skills: state.skills.map(s => s.id === id ? { ...s, level } : s) 
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'openclaw-skills', // localStorage key
    }
  )
)

// 便捷访问
export const useSkills = () => useSkillsStore((s) => s.skills)
export const useLocalSkills = () => useSkillsStore((s) => s.skills.filter(s => s.source === 'local'))
export const useMarketSkills = () => useSkillsStore((s) => s.skills.filter(s => s.source === 'market'))
export const useSkillsByCategory = (category: string) => useSkillsStore((s) => s.skills.filter(s => s.category === category))
