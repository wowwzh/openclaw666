// ============================================
// Gateway 进程管理（参考 ClawX electron/gateway/manager.ts）
// ============================================

import { GatewayStatus } from '../stores/types'

// 模拟进程管理（实际需要 Electron IPC）
class GatewayProcessManager {
  private status: GatewayStatus = {
    state: 'stopped',
    port: 18789,
  }
  private listeners: Set<(status: GatewayStatus) => void> = new Set()

  // 监听状态变化
  onStatusChange(callback: (status: GatewayStatus) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyStatusChange() {
    this.listeners.forEach(cb => cb(this.status))
  }

  // 获取状态
  getStatus(): GatewayStatus {
    return this.status
  }

  // 检查是否正在运行
  isRunning(): boolean {
    return this.status.state === 'running'
  }

  // 启动 Gateway
  async start(): Promise<void> {
    if (this.status.state === 'running') {
      console.log('[ProcessManager] Already running')
      return
    }

    this.status = { ...this.status, state: 'starting' }
    this.notifyStatusChange()

    try {
      // TODO: 调用 Electron IPC 启动 Gateway
      // 模拟启动延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      this.status = {
        state: 'running',
        port: 18789,
        pid: Math.floor(Math.random() * 10000),
        uptime: 0,
        version: '2026.2.25',
      }
      console.log('[ProcessManager] Started successfully')
    } catch (error) {
      this.status = {
        state: 'error',
        port: 18789,
        error: (error as Error).message,
      }
      console.error('[ProcessManager] Start failed:', error)
    }

    this.notifyStatusChange()
  }

  // 停止 Gateway
  async stop(): Promise<void> {
    if (this.status.state === 'stopped') {
      console.log('[ProcessManager] Already stopped')
      return
    }

    this.status = { ...this.status, state: 'stopping' }
    this.notifyStatusChange()

    try {
      // TODO: 调用 Electron IPC 停止 Gateway
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.status = {
        state: 'stopped',
        port: 18789,
      }
      console.log('[ProcessManager] Stopped successfully')
    } catch (error) {
      this.status = {
        state: 'error',
        port: 18789,
        error: (error as Error).message,
      }
      console.error('[ProcessManager] Stop failed:', error)
    }

    this.notifyStatusChange()
  }

  // 重启 Gateway
  async restart(): Promise<void> {
    console.log('[ProcessManager] Restarting...')
    await this.stop()
    await this.start()
    console.log('[ProcessManager] Restarted')
  }

  // 模拟状态更新（用于测试）
  simulateUptime() {
    if (this.status.state === 'running') {
      this.status.uptime = (this.status.uptime || 0) + 1
      this.notifyStatusChange()
    }
  }
}

// 单例
export const gatewayProcess = new GatewayProcessManager()

// 启动 Gateway
export async function startGateway(): Promise<void> {
  return gatewayProcess.start()
}

// 停止 Gateway
export async function stopGateway(): Promise<void> {
  return gatewayProcess.stop()
}

// 重启 Gateway
export async function restartGateway(): Promise<void> {
  return gatewayProcess.restart()
}

// 获取状态
export function getGatewayStatus(): GatewayStatus {
  return gatewayProcess.getStatus()
}

// 监听状态变化
export function onGatewayStatusChange(callback: (status: GatewayStatus) => void) {
  return gatewayProcess.onStatusChange(callback)
}
