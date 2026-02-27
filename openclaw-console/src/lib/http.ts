// ============================================
// HTTP 请求封装
// ============================================

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  status?: number
}

// 默认配置
const defaultOptions: RequestOptions = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
}

// 请求函数
async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout, retries, retryDelay, ...fetchOptions } = { ...defaultOptions, ...options }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  let lastError: Error | null = null
  
  // 重试逻辑
  for (let attempt = 0; attempt <= retries!; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        return {
          ok: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        }
      }

      // 解析 JSON
      const contentType = response.headers.get('content-type')
      let data: T
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text() as any
      }

      return {
        ok: true,
        data,
        status: response.status,
      }
    } catch (error) {
      lastError = error as Error
      
      // 如果是最后一次尝试
      if (attempt === retries) {
        clearTimeout(timeoutId)
        
        // 判断错误类型
        if ((error as Error).name === 'AbortError') {
          return { ok: false, error: '请求超时' }
        }
        
        return { ok: false, error: (error as Error).message }
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay! * Math.pow(2, attempt)))
    }
  }

  return { ok: false, error: lastError?.message || '未知错误' }
}

// 便捷方法
export const http = {
  get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, { ...options, method: 'GET' })
  },

  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, {
      ...options,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, { ...options, method: 'DELETE' })
  },

  upload<T = any>(
    url: string, 
    file: File | Blob, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return request<T>(url, {
      ...options,
      method: 'POST',
      body: formData,
    })
  },
}

// ========== API 基类 ==========

export class ApiClient {
  constructor(private baseUrl: string) {}

  async get<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return http.get<T>(this.baseUrl + path, options)
  }

  async post<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return http.post<T>(this.baseUrl + path, data, options)
  }

  async put<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return http.put<T>(this.baseUrl + path, data, options)
  }

  async patch<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return http.patch<T>(this.baseUrl + path, data, options)
  }

  async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return http.delete<T>(this.baseUrl + path, options)
  }
}

// 示例：创建 Gateway API 客户端
export const gatewayApi = new ApiClient('http://localhost:18789')

// 使用示例
/*
const result = await gatewayApi.get('/api/status')
if (result.ok) {
  console.log(result.data)
}

const result2 = await gatewayApi.post('/api/chat', { message: '你好' })
if (result2.ok) {
  console.log(result2.data)
}
*/
