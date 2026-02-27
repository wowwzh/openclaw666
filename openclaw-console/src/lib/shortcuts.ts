// ============================================
// 快捷键管理
// ============================================

type ShortcutHandler = (event: KeyboardEvent) => void

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: ShortcutHandler
  description?: string
}

class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private enabled = true

  // 注册快捷键
  register(id: string, shortcut: Shortcut): void {
    this.shortcuts.set(id, shortcut)
    console.log(`[Shortcuts] Registered: ${id} (${shortcut.key})`)
  }

  // 注销快捷键
  unregister(id: string): void {
    this.shortcuts.delete(id)
  }

  // 启用/禁用
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // 处理键盘事件
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false

    for (const [id, shortcut] of this.shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey)
      const shiftMatch = !!shortcut.shift === event.shiftKey
      const altMatch = !!shortcut.alt === event.altKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault()
        try {
          shortcut.handler(event)
          console.log(`[Shortcuts] Executed: ${id}`)
          return true
        } catch (e) {
          console.error(`[Shortcuts] Error in ${id}:`, e)
        }
      }
    }
    return false
  }

  // 获取所有快捷键
  getAll(): { id: string; key: string; description?: string }[] {
    return Array.from(this.shortcuts.entries()).map(([id, s]) => ({
      id,
      key: s.key,
      description: s.description,
    }))
  }
}

export const shortcutManager = new ShortcutManager()

// 默认快捷键
export function registerDefaultShortcuts(handlers: {
  onNewChat?: () => void
  onToggleSidebar?: () => void
  onToggleTheme?: () => void
  onSearch?: () => void
  onSettings?: () => void
  onQuickCommand?: () => void
}) {
  // Ctrl+N: 新会话
  handlers.onNewChat && shortcutManager.register('new-chat', {
    key: 'n',
    ctrl: true,
    handler: handlers.onNewChat,
    description: '新建会话',
  })

  // Ctrl+B: 切换侧边栏
  handlers.onToggleSidebar && shortcutManager.register('toggle-sidebar', {
    key: 'b',
    ctrl: true,
    handler: handlers.onToggleSidebar,
    description: '切换侧边栏',
  })

  // Ctrl+Shift+T: 切换主题
  handlers.onToggleTheme && shortcutManager.register('toggle-theme', {
    key: 't',
    ctrl: true,
    shift: true,
    handler: handlers.onToggleTheme,
    description: '切换主题',
  })

  // Ctrl+K: 搜索
  handlers.onSearch && shortcutManager.register('search', {
    key: 'k',
    ctrl: true,
    handler: handlers.onSearch,
    description: '搜索',
  })

  // Ctrl+,: 设置
  handlers.onSettings && shortcutManager.register('settings', {
    key: ',',
    ctrl: true,
    handler: handlers.onSettings,
    description: '打开设置',
  })

  // Ctrl+/: 快捷命令
  handlers.onQuickCommand && shortcutManager.register('quick-command', {
    key: '/',
    ctrl: true,
    handler: handlers.onQuickCommand,
    description: '快捷命令',
  })
}

// 初始化键盘监听
export function initShortcuts(handlers: Parameters<typeof registerDefaultShortcuts>[0]) {
  registerDefaultShortcuts(handlers)
  
  document.addEventListener('keydown', (e) => {
    shortcutManager.handleKeyDown(e)
  })

  console.log('[Shortcuts] Initialized')
}
