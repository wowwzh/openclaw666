// LLM API 调用
const LLM_API_BASE_URL = 'http://localhost:18789'

// 获取认证 Token
function getToken(): string {
  return localStorage.getItem('gateway_token') || ''
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  message: {
    role: 'assistant'
    content: string
  }
  conversation_id?: string
  error?: string
}

// 发送消息到 LLM
export async function sendMessage(text: string, conversationId?: string): Promise<ChatResponse> {
  const token = getToken()
  
  const url = conversationId 
    ? `${LLM_API_BASE_URL}/conversations/${conversationId}/messages`
    : `${LLM_API_BASE_URL}/chat`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: text,
      ...(conversationId && { conversation_id: conversationId }),
    }),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to send message: ${response.statusText}`)
  }
  
  return response.json()
}

// 获取对话历史
export async function getHistory(conversationId?: string): Promise<ChatMessage[]> {
  const token = getToken()
  
  const url = conversationId
    ? `${LLM_API_BASE_URL}/conversations/${conversationId}/messages`
    : `${LLM_API_BASE_URL}/chat/history`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.messages || data || []
}

// 获取会话列表
export async function getConversations(): Promise<Array<{ id: string; title: string; updated_at: string }>> {
  const token = getToken()
  
  const response = await fetch(`${LLM_API_BASE_URL}/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.conversations || data || []
}

// 创建新会话
export async function createConversation(title?: string): Promise<{ id: string }> {
  const token = getToken()
  
  const response = await fetch(`${LLM_API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`)
  }
  
  return response.json()
}

// 删除会话
export async function deleteConversation(conversationId: string): Promise<void> {
  const token = getToken()
  
  const response = await fetch(`${LLM_API_BASE_URL}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`)
  }
}
