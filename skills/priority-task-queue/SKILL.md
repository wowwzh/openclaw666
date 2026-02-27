/**
 * 优先级任务队列
 * Priority Task Queue
 * 
 * 特性：
 * - 优先级调度 (Priority Scheduling)
 * - 公平队列 (Fair Queuing)
 * - 任务权重 (Task Weight)
 * - 延迟执行 (Delayed Execution)
 * 
 * 信号: queue_priority, task_ordering, priority_inversion
 */

class PriorityQueue {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.queues = new Map();
    this.processing = new Set();
    this.completed = new Map();
    this.priorityLevels = options.priorityLevels || {
      critical: 0,  // 最高优先级
      high: 1,
      normal: 2,
      low: 3,
      background: 4  // 最低优先级
    };
  }

  /**
   * 添加任务
   */
  async add(task, options = {}) {
    const priority = options.priority || 'normal';
    const priorityLevel = this.priorityLevels[priority];
    
    if (priorityLevel === undefined) {
      throw new Error(`Invalid priority: ${priority}`);
    }
    
    if (!this.queues.has(priorityLevel)) {
      this.queues.set(priorityLevel, []);
    }
    
    const queueItem = {
      id: task.id || this.generateId(),
      task,
      priority,
      priorityLevel,
      weight: options.weight || 1,
      delay: options.delay || 0,
      createdAt: Date.now(),
      retries: 0,
      maxRetries: options.maxRetries || 3,
      metadata: options.metadata || {}
    };
    
    this.queues.get(priorityLevel).push(queueItem);
    
    // 按权重排序
    this.queues.get(priorityLevel).sort((a, b) => b.weight - a.weight);
    
    return queueItem.id;
  }

  /**
   * 获取下一个任务
   */
  next() {
    // 按优先级从高到低遍历
    const sortedLevels = Array.from(this.queues.keys()).sort((a, b) => a - b);
    
    for (const level of sortedLevels) {
      const queue = this.queues.get(level);
      if (queue && queue.length > 0) {
        const item = queue.shift();
        
        // 检查延迟
        if (item.delay > 0) {
          const waitTime = item.delay - (Date.now() - item.createdAt);
          if (waitTime > 0) {
            // 重新加入队列
            queue.unshift(item);
            continue;
          }
        }
        
        this.processing.add(item.id);
        return item;
      }
    }
    
    return null;
  }

  /**
   * 完成任务
   */
  complete(taskId, result = null) {
    this.processing.delete(taskId);
    this.completed.set(taskId, {
      status: 'completed',
      result,
      completedAt: Date.now()
    });
  }

  /**
   * 失败任务
   */
  fail(taskId, error = null) {
    this.processing.delete(taskId);
    
    // 找到任务并重试
    for (const queue of this.queues.values()) {
      const task = queue.find(t => t.id === taskId);
      if (task) {
        if (task.retries < task.maxRetries) {
          task.retries++;
          // 降低优先级重试
          task.priorityLevel = Math.min(task.priorityLevel + 1, 4);
          console.log(`[PriorityQueue] Task ${taskId} failed, retry ${task.retries}/${task.maxRetries}`);
          return true;
        }
        break;
      }
    }
    
    this.completed.set(taskId, {
      status: 'failed',
      error: error?.message || String(error),
      failedAt: Date.now()
    });
    return false;
  }

  /**
   * 取消任务
   */
  cancel(taskId) {
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(t => t.id === taskId);
      if (index !== -1) {
        queue.splice(index, 1);
        this.completed.set(taskId, {
          status: 'cancelled',
          cancelledAt: Date.now()
        });
        return true;
      }
    }
    return false;
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    const status = {
      pending: 0,
      processing: this.processing.size,
      completed: this.completed.size,
      byPriority: {}
    };
    
    for (const [level, queue] of this.queues) {
      status.pending += queue.length;
      const priorityName = Object.entries(this.priorityLevels)
        .find(([, l]) => l === level)?.[0] || 'unknown';
      status.byPriority[priorityName] = queue.length;
    }
    
    return status;
  }

  /**
   * 获取任务详情
   */
  getTask(taskId) {
    for (const queue of this.queues.values()) {
      const task = queue.find(t => t.id === taskId);
      if (task) return { ...task, status: 'pending' };
    }
    
    if (this.processing.has(taskId)) {
      return { id: taskId, status: 'processing' };
    }
    
    return this.completed.get(taskId);
  }

  /**
   * 清空已完成
   */
  cleanCompleted(before = null) {
    if (before === null) {
      before = Date.now() - 24 * 60 * 60 * 1000; // 默认24小时前
    }
    
    let cleaned = 0;
    for (const [id, record] of this.completed) {
      const time = record.completedAt || record.failedAt || record.cancelledAt;
      if (time < before) {
        this.completed.delete(id);
        cleaned++;
      }
    }
    return cleaned;
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 任务调度器
 */
class TaskScheduler {
  constructor(queue, options = {}) {
    this.queue = queue;
    this.interval = options.interval || 1000;
    this.running = false;
    this.handlers = new Map();
    this.schedulerId = null;
  }

  /**
   * 注册处理器
   */
  handle(priority, handler) {
    this.handlers.set(priority, handler);
  }

  /**
   * 启动调度器
   */
  start() {
    if (this.running) return;
    this.running = true;
    
    const loop = async () => {
      if (!this.running) return;
      
      const taskItem = this.queue.next();
      if (taskItem) {
        try {
          const handler = this.handlers.get(taskItem.priority);
          if (handler) {
            const result = await handler(taskItem.task, taskItem.metadata);
            this.queue.complete(taskItem.id, result);
          } else {
            console.log(`[Scheduler] No handler for priority: ${taskItem.priority}`);
            this.queue.complete(taskItem.id, { skipped: true });
          }
        } catch (error) {
          console.log(`[Scheduler] Task failed:`, error.message);
          this.queue.fail(taskItem.id, error);
        }
      }
      
      this.schedulerId = setTimeout(loop, this.interval);
    };
    
    loop();
  }

  /**
   * 停止调度器
   */
  stop() {
    this.running = false;
    if (this.schedulerId) {
      clearTimeout(this.schedulerId);
    }
  }
}

/**
 * 创建优先级队列
 */
function createPriorityQueue(options) {
  return new PriorityQueue(options);
}

/**
 * 创建调度器
 */
function createTaskScheduler(queue, options) {
  return new TaskScheduler(queue, options);
}

module.exports = {
  PriorityQueue,
  TaskScheduler,
  createPriorityQueue,
  createTaskScheduler
};
