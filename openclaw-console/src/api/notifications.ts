// ============================================
// 桌面通知管理
// ============================================

// 通知权限
type NotificationPermission = 'granted' | 'denied' | 'default'

// 通知选项
interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  tag?: string
  silent?: boolean
  requireInteraction?: boolean
  onClick?: () => void
}

// 通知管理器
class NotificationManager {
  private permission: NotificationPermission = 'default'
  private notifications: Map<string, number> = new Map() // tag -> count

  // 请求权限
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted'
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    }

    return false
  }

  // 检查权限
  isGranted(): boolean {
    return this.permission === 'granted' || Notification.permission === 'granted'
  }

  // 发送通知
  async send(options: NotificationOptions): Promise<Notification | null> {
    // 请求权限（如果还没请求）
    if (this.permission === 'default') {
      await this.requestPermission()
    }

    if (!this.isGranted()) {
      console.warn('[Notifications] Permission not granted')
      return null
    }

    // 检查重复通知
    if (options.tag) {
      const count = this.notifications.get(options.tag) || 0
      if (count > 0) {
        // 已存在相同标签的通知，更新计数
        this.notifications.set(options.tag, count + 1)
      } else {
        this.notifications.set(options.tag, 1)
      }
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon.png',
      tag: options.tag,
      silent: options.silent,
      requireInteraction: options.requireInteraction,
    })

    if (options.onClick) {
      notification.onclick = () => {
        options.onClick!()
        notification.close()
      }
    }

    // 5秒后自动关闭
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  }

  // 便捷方法
  async info(title: string, body?: string): Promise<Notification | null> {
    return this.send({ title, body })
  }

  async success(title: string, body?: string): Promise<Notification | null> {
    return this.send({ title, body, silent: true })
  }

  async error(title: string, body?: string): Promise<Notification | null> {
    return this.send({ title, body, requireInteraction: true })
  }

  // 消息通知
  async notifyMessage(sender: string, content: string): Promise<Notification | null> {
    return this.send({
      title: `新消息 from ${sender}`,
      body: content.slice(0, 100),
      tag: 'message',
    })
  }

  // 任务通知
  async notifyTask(name: string, status: 'success' | 'error', message?: string): Promise<Notification | null> {
    const title = status === 'success' ? `✅ 任务完成: ${name}` : `❌ 任务失败: ${name}`
    return this.send({
      title,
      body: message,
      tag: `task-${name}`,
    })
  }

  // 系统通知
  async notifySystem(title: string, body?: string): Promise<Notification | null> {
    return this.send({
      title: `🔔 ${title}`,
      body,
      tag: 'system',
    })
  }

  // 清除通知计数
  clearCount(tag: string) {
    this.notifications.delete(tag)
  }

  // 获取通知计数
  getCount(tag: string): number {
    return this.notifications.get(tag) || 0
  }
}

// 单例
export const notifications = new NotificationManager()

// 便捷函数
export async function notify(title: string, body?: string): Promise<Notification | null> {
  return notifications.send({ title, body })
}

export async function notifySuccess(title: string, body?: string): Promise<Notification | null> {
  return notifications.success(title, body)
}

export async function notifyError(title: string, body?: string): Promise<Notification | null> {
  return notifications.error(title, body)
}

export async function notifyMessage(sender: string, content: string): Promise<Notification | null> {
  return notifications.notifyMessage(sender, content)
}

export async function notifyTask(name: string, status: 'success' | 'error', message?: string): Promise<Notification | null> {
  return notifications.notifyTask(name, status, message)
}

export async function requestNotificationPermission(): Promise<boolean> {
  return notifications.requestPermission()
}
