// EvoMap API 调用
// 基于官方文档: https://evomap.ai/wiki#03-for-ai-agents

const EVOMAP_API_BASE = 'https://evomap.ai/a2a'

// ==================== 类型定义 ====================

export interface NodeInfo {
  node_id: string
  reputation: number
  total_assets: number
  promoted_count: number
  rejected_count: number
  revoked_count: number
}

export interface Capsule {
  asset_id: string
  name: string
  description: string
  category: string
  author: string
  gdi_score?: number
  status: 'candidate' | 'promoted' | 'rejected'
  created_at: string
}

export interface Task {
  task_id: string
  title: string
  body: string
  amount: number
  signals: string[]
  status: 'open' | 'claimed' | 'completed'
  created_at: string
}

export interface Earnings {
  total_points: number
  total_credits: number
  payout_history: Array<{ date: string; amount: number }>
}

export interface PublishResult {
  status: 'acknowledged' | 'error'
  asset_id?: string
  error?: string
}

// ==================== 核心API ====================

/**
 * 注册节点 (Step 1)
 * 发送 hello 消息注册你的 Agent
 */
export async function registerNode(nodeId: string): Promise<{ claim_code: string; claim_url: string }> {
  const response = await fetch(`${EVOMAP_API_BASE}/hello`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protocol: 'gep-a2a',
      protocol_version: '1.0.0',
      message_type: 'hello',
      message_id: `msg_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
      sender_id: nodeId,
      timestamp: new Date().toISOString(),
      payload: {
        capabilities: {},
        gene_count: 3,
        capsule_count: 5,
        env_fingerprint: {
          node_version: '1.0.0',
          platform: 'browser',
          arch: 'x64'
        }
      }
    })
  })
  return response.json()
}

/**
 * 发布方案 (Step 3)
 * 发布 Gene + Capsule bundle
 */
export async function publishCapsule(nodeId: string, assets: any[], chainId?: string): Promise<PublishResult> {
  const response = await fetch(`${EVOMAP_API_BASE}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: nodeId,
      timestamp: new Date().toISOString(),
      payload: {
        assets,
        signature: '...', // 需要签名
        chain_id: chainId
      }
    })
  })
  return response.json()
}

/**
 * 搜索方案 (Step 4)
 * 搜索已发布的 Capsules
 */
export async function searchCapsules(nodeId: string, query: string, includeTasks = false): Promise<{ capsules: Capsule[]; tasks: Task[] }> {
  const response = await fetch(`${EVOMAP_API_BASE}/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: nodeId,
      payload: {
        asset_type: 'Capsule',
        query,
        include_tasks: includeTasks
      }
    })
  })
  return response.json()
}

// ==================== 声誉查询 ====================

/**
 * 查询声誉 (Step 5)
 * 检查你的声誉分数
 */
export async function getReputation(nodeId: string): Promise<NodeInfo> {
  const response = await fetch(`${EVOMAP_API_BASE}/nodes/${nodeId}`)
  return response.json()
}

/**
 * 查询收益 (Step 6)
 * 检查你的收益
 */
export async function getEarnings(agentId: string): Promise<Earnings> {
  const response = await fetch(`${EVOMAP_API_BASE}/billing/earnings/${agentId}`)
  return response.json()
}

// ==================== 任务大厅 ====================

/**
 * 列出可用任务
 * 根据声誉等级筛选
 */
export async function listTasks(nodeId: string, limit = 10): Promise<Task[]> {
  const response = await fetch(`${EVOMAP_API_BASE}/task/list?reputation=${nodeId}&limit=${limit}`)
  const data = await response.json()
  return data.tasks || []
}

/**
 * 认领任务
 */
export async function claimTask(nodeId: string, taskId: string): Promise<{ status: string }> {
  const response = await fetch(`${EVOMAP_API_BASE}/task/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, node_id: nodeId })
  })
  return response.json()
}

/**
 * 完成任务
 */
export async function completeTask(nodeId: string, taskId: string, assetId: string): Promise<{ status: string }> {
  const response = await fetch(`${EVOMAP_API_BASE}/task/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, asset_id: assetId, node_id: nodeId })
  })
  return response.json()
}

/**
 * 查询我认领的任务
 */
export async function getMyTasks(nodeId: string): Promise<Task[]> {
  const response = await fetch(`${EVOMAP_API_BASE}/task/my?node_id=${nodeId}`)
  const data = await response.json()
  return data.tasks || []
}

// ==================== 群体智能 ====================

/**
 * 提议任务分解 (Swarm)
 * 复杂任务分解为子任务
 */
export async function proposeDecomposition(nodeId: string, taskId: string, subtasks: Array<{ title: string; body: string; weight: number }>): Promise<{ status: string }> {
  const response = await fetch(`${EVOMAP_API_BASE}/task/propose-decomposition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: taskId,
      node_id: nodeId,
      subtasks
    })
  })
  return response.json()
}

/**
 * 查询 Swarm 状态
 */
export async function getSwarmStatus(taskId: string): Promise<any> {
  const response = await fetch(`${EVOMAP_API_BASE}/task/swarm/${taskId}`)
  return response.json()
}

// ==================== 主动提问 ====================

/**
 * 主动提问 (Agent 自主)
 */
export async function askQuestion(nodeId: string, question: string, amount = 0, signals: string[] = []): Promise<{ status: string; bounty_id: string; question_id: string }> {
  const response = await fetch(`${EVOMAP_API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: nodeId,
      question,
      amount,
      signals
    })
  })
  return response.json()
}

// ==================== 验证报告 ====================

/**
 * 提交验证报告
 */
export async function submitReport(nodeId: string, assetId: string, verdict: 'pass' | 'fail', reason?: string): Promise<{ status: string }> {
  const response = await fetch(`${EVOMAP_API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: nodeId,
      asset_id: assetId,
      verdict,
      reason
    })
  })
  return response.json()
}

// ==================== 工具函数 ====================

/**
 * 计算 Asset ID (SHA256) - 浏览器兼容版
 */
export async function computeAssetId(asset: any): Promise<string> {
  const clean = { ...asset }
  delete clean.asset_id
  const sorted = JSON.stringify(clean, Object.keys(clean).sort())
  const msgBuffer = new TextEncoder().encode(sorted)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return 'sha256:' + hashHex
}

/**
 * 检查自动推广资格
 */
export function checkAutoPromotion(capsule: Capsule): boolean {
  if (!capsule.gdi_score || capsule.gdi_score < 25) return false
  return true
}

// 导出所有 API
export default {
  registerNode,
  publishCapsule,
  searchCapsules,
  getReputation,
  getEarnings,
  listTasks,
  claimTask,
  completeTask,
  getMyTasks,
  proposeDecomposition,
  getSwarmStatus,
  askQuestion,
  submitReport,
  computeAssetId,
  checkAutoPromotion
}
