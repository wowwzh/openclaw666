// ============================================
// Electron Preload Script
// ============================================

import { contextBridge, ipcRenderer } from 'electron'

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 窗口控制
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  // 外部链接
  shell: {
    open: (url: string) => ipcRenderer.send('shell:open', url),
  },

  // Gateway 控制
  gateway: {
    start: () => ipcRenderer.invoke('gateway:start'),
    stop: () => ipcRenderer.invoke('gateway:stop'),
    status: () => ipcRenderer.invoke('gateway:status'),
  },

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['menu:new-chat', 'menu:settings', 'gateway:status-changed']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args))
    }
  },

  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },
})

// 类型声明
declare global {
  interface Window {
    electron: {
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
      }
      shell: {
        open: (url: string) => void
      }
      gateway: {
        start: () => Promise<{ success: boolean }>
        stop: () => Promise<{ success: boolean }>
        status: () => Promise<{ state: string; port: number }>
      }
      on: (channel: string, callback: (...args: any[]) => void) => void
      removeListener: (channel: string, callback: (...args: any[]) => void) => void
    }
  }
}
