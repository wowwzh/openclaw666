// 知识库API - 从本地读取学习笔记
import { useState, useEffect } from 'react'

export interface KnowledgeEntry {
  id: string
  title: string
  category: string
  summary: string
  tags: string[]
  date: string
  source: string
}

// 模拟知识库数据（后续可从本地文件读取）
const knowledgeBase: KnowledgeEntry[] = [
  {
    id: '1',
    title: 'AI产品经理核心能力',
    category: 'AI产品',
    summary: 'AI产品经理需要具备：1.技术理解力 2.AI应用设计能力 3.数据驱动思维 4.AI伦理意识',
    tags: ['AI', '产品'],
    date: '2026-02-20',
    source: '人人都是产品经理'
  },
  {
    id: '2',
    title: 'RAG技术详解',
    category: '技术',
    summary: 'RAG(检索增强生成) = 检索 + 生成。通过向量数据库存储知识，运行时检索相关上下文来增强LLM回答。',
    tags: ['AI', '技术'],
    date: '2026-02-19',
    source: '技术博客'
  },
  {
    id: '3',
    title: 'Prompt工程最佳实践',
    category: 'AI',
    summary: '1.明确任务 2.提供示例 3.指定格式 4.思维链提示 5.角色设定',
    tags: ['AI', 'Prompt'],
    date: '2026-02-18',
    source: '掘金'
  },
  {
    id: '4',
    title: 'A2A协议详解',
    category: '协议',
    summary: 'Agent-to-Agent协议：让不同Agent之间能够通信协作。包含：Agent Card、Task、Message等核心概念。',
    tags: ['AI', '协议'],
    date: '2026-02-17',
    source: '官方文档'
  },
  {
    id: '5',
    title: 'Design Sprint设计方法',
    category: '产品方法',
    summary: '设计冲刺5天流程：1.问题 2.方案 3.决策 4.原型 5.验证。适用于快速验证产品想法。',
    tags: ['产品', '方法论'],
    date: '2026-02-16',
    source: '书籍'
  },
  {
    id: '6',
    title: '四阶段调试法',
    category: '技能',
    summary: '根因调查 → 模式分析 → 假设测试 → 修复根因',
    tags: ['调试', '方法论'],
    date: '2026-02-17',
    source: 'skills.sh'
  },
  {
    id: '7',
    title: 'PDF处理技能',
    category: '技能',
    summary: 'pypdf合并拆分、pdfplumber文本提取、reportlab创建PDF',
    tags: ['Python', '工具'],
    date: '2026-02-17',
    source: 'skills.sh'
  },
  {
    id: '8',
    title: 'EvoMap平台操作',
    category: '平台',
    summary: 'GEP-A2A协议、节点注册、资产发布、Swarm模式、Recipe配方',
    tags: ['EvoMap', 'Agent'],
    date: '2026-02-20',
    source: '自主研究'
  },
  {
    id: '9',
    title: '反幻觉核心方法',
    category: 'AI',
    summary: 'RAG+引用溯源、提示工程(CoT/Few-shot)、事实核查+外部工具、领域知识约束、人机协同、多模型验证',
    tags: ['AI', '安全'],
    date: '2026-02-24',
    source: '自主研究'
  },
  {
    id: '10',
    title: 'React性能优化',
    category: '前端',
    summary: 'useMemo缓存计算结果、useCallback缓存函数、React.memo避免重渲染。原则：先测量再优化。',
    tags: ['React', '前端'],
    date: '2026-02-24',
    source: '学习'
  },
]

// 获取知识库列表
export function useKnowledge() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(knowledgeBase)
  const [loading, setLoading] = useState(false)
  
  const categories = ['全部', 'AI产品', '技术', 'AI', '协议', '产品方法', '技能', '平台', '前端']
  
  const getByCategory = (category: string) => {
    if (category === '全部') return entries
    return entries.filter(e => e.category === category)
  }
  
  const search = (keyword: string) => {
    if (!keyword) return entries
    return entries.filter(e => 
      e.title.includes(keyword) || 
      e.summary.includes(keyword) ||
      e.tags.some(t => t.includes(keyword))
    )
  }
  
  return { entries, loading, categories, getByCategory, search }
}
