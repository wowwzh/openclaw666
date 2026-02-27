/**
 * Smart Rate Limiter
 * 智能API限流器
 * 功能：滑动窗口限流 + 自动检测API配额 + 自适应限流
 */

class SmartRateLimiter {
  constructor(options = {
    requestsPerWindow: 100,  // 窗口内最大请求数
    windowMs: 60000,         // 窗口时间(ms)
    autoAdjust: true,        // 自动调整限流
    onThrottle: null         // 限流回调
  }) {
    this.requestsPerWindow = options.requestsPerWindow || 100;
    this.windowMs = options.windowMs || 60000;
    this.autoAdjust = options.autoAdjust !== false;
    this.onThrottle = options.onThrottle || null;
    
    // 请求记录
    this.requests = [];
    
    // 配额检测
    this.quotaRemaining = null;
    this.quotaResetTime = null;
  }

  // 滑动窗口检查
  canProceed() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // 清理过期的请求记录
    this.requests = this.requests.filter(t => t > windowStart);
    
    // 检查是否超限
    if (this.requests.length >= this.requestsPerWindow) {
      if (this.onThrottle) {
        this.onThrottle(this.requests.length, this.requestsPerWindow);
      }
      return false;
    }
    
    return true;
  }

  // 记录请求
  recordRequest() {
    this.requests.push(Date.now());
  }

  // 处理 429 响应
  handleRateLimitResponse(headers) {
    // 从响应头获取配额信息
    const remaining = headers['x-rate-limit-remaining'];
    const reset = headers['x-rate-limit-reset'];
    const retryAfter = headers['retry-after'];
    
    if (remaining !== undefined) {
      this.quotaRemaining = parseInt(remaining);
    }
    
    if (reset !== undefined) {
      this.quotaResetTime = parseInt(reset) * 1000;
    }
    
    // 如果收到429，自动降低速率
    if (this.autoAdjust && this.quotaRemaining !== null) {
      if (this.quotaRemaining < 10) {
        // 配额紧张，降低到25%
        this.requestsPerWindow = Math.floor(this.requestsPerWindow * 0.25);
      } else if (this.quotaRemaining < 30) {
        // 配额不足，降低到50%
        this.requestsPerWindow = Math.floor(this.requestsPerWindow * 0.5);
      }
    }
    
    // 返回等待时间
    if (retryAfter) {
      return parseInt(retryAfter) * 1000;
    }
    
    if (this.quotaResetTime) {
      return Math.max(0, this.quotaResetTime - Date.now());
    }
    
    // 默认等待时间
    return this.windowMs / this.requestsPerWindow;
  }

  // 自适应限流执行
  async execute(fn) {
    // 检查是否可以执行
    while (!this.canProceed()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 记录请求
    this.recordRequest();
    
    try {
      const result = await fn();
      
      // 如果返回了headers，处理限流信息
      if (result.headers) {
        const waitTime = this.handleRateLimitResponse(result.headers);
        if (waitTime > 0) {
          console.log(`Rate limited, waiting ${waitTime}ms`);
        }
      }
      
      return result;
    } catch (error) {
      // 如果是429错误，处理限流
      if (error.status === 429 || error.message?.includes('429')) {
        const waitTime = this.handleRateLimitResponse(error.headers || {});
        if (waitTime > 0) {
          console.log(`Rate limited (429), waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          // 重试一次
          return await this.execute(fn);
        }
      }
      throw error;
    }
  }

  // 获取当前状态
  getStatus() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const activeRequests = this.requests.filter(t => t > windowStart).length;
    
    return {
      activeRequests,
      limit: this.requestsPerWindow,
      remaining: this.requestsPerWindow - activeRequests,
      quotaRemaining: this.quotaRemaining,
      quotaResetTime: this.quotaResetTime
    };
  }
}

// 导出
module.exports = { SmartRateLimiter };
