// ============================================
// 本地存储管理
// ============================================

// 存储键前缀
const PREFIX = 'openclaw-'

// 存储工具类
export const storage = {
  // 设置
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(PREFIX + key, serialized)
    } catch (e) {
      console.error('[Storage] Set failed:', e)
    }
  },

  // 获取
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(PREFIX + key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch (e) {
      console.error('[Storage] Get failed:', e)
      return defaultValue
    }
  },

  // 删除
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  // 清空
  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },

  // 检查是否存在
  has(key: string): boolean {
    return localStorage.getItem(PREFIX + key) !== null
  },

  // 获取所有键
  keys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(PREFIX))
      .map(key => key.slice(PREFIX.length))
  },
}

// 会话存储（临时）
export const session = {
  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('[Session] Set failed:', e)
    }
  },

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = sessionStorage.getItem(PREFIX + key)
      if (item === null) return defaultValue
      return JSON.parse(item) as T
    } catch (e) {
      console.error('[Session] Get failed:', e)
      return defaultValue
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(PREFIX + key)
  },

  clear(): void {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        sessionStorage.removeItem(key)
      }
    })
  },
}

// Cookie 管理
export const cookie = {
  set(name: string, value: string, days = 7): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${PREFIX}${name}=${value};expires=${expires.toUTCString()};path=/`
  },

  get(name: string): string | undefined {
    const nameEQ = PREFIX + name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return undefined
  },

  remove(name: string): void {
    document.cookie = `${PREFIX}${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  },
}

// 存储使用统计
export function getStorageStats() {
  let totalSize = 0
  const items: { key: string; size: number }[] = []

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith(PREFIX)) {
      const size = localStorage[key].length + key.length
      totalSize += size
      items.push({ key: key.slice(PREFIX.length), size })
    }
  }

  return {
    count: items.length,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    items: items.sort((a, b) => b.size - a.size).slice(0, 10),
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
