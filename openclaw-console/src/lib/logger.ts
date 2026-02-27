// ============================================
// 日志系统
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private listeners: Set<(entry: LogEntry) => void> = new Set()

  // 添加日志
  log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    }

    this.logs.push(entry)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 通知监听器
    this.listeners.forEach(cb => cb(entry))

    // 控制台输出
    const prefix = `[${level.toUpperCase()}]`
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '')
        break
      case 'info':
        console.info(prefix, message, data || '')
        break
      case 'warn':
        console.warn(prefix, message, data || '')
        break
      case 'error':
        console.error(prefix, message, data || '')
        break
    }
  }

  // 便捷方法
  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  // 获取日志
  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let logs = this.logs
    if (level) {
      logs = logs.filter(l => l.level === level)
    }
    return logs.slice(-limit)
  }

  // 清空日志
  clear() {
    this.logs = []
  }

  // 订阅日志
  subscribe(callback: (entry: LogEntry) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // 导出日志
  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // 打印统计
  stats() {
    const stats = {
      total: this.logs.length,
      debug: this.logs.filter(l => l.level === 'debug').length,
      info: this.logs.filter(l => l.level === 'info').length,
      warn: this.logs.filter(l => l.level === 'warn').length,
      error: this.logs.filter(l => l.level === 'error').length,
    }
    console.table(stats)
    return stats
  }
}

// 单例
export const logger = new Logger()

// 全局错误处理
export function initGlobalErrorHandler() {
  // 未捕获的错误
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // 未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
    })
  })

  // Vue/React 错误边界
  console.log('[Logger] Global error handler initialized')
}

// 便捷方法
export const debug = (msg: string, data?: any) => logger.debug(msg, data)
export const info = (msg: string, data?: any) => logger.info(msg, data)
export const warn = (msg: string, data?: any) => logger.warn(msg, data)
export const error = (msg: string, data?: any) => logger.error(msg, data)
