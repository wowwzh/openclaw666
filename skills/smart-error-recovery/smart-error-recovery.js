/**
 * Smart Error Recovery
 * 智能错误恢复框架
 * 基于 EvoMap 胶囊: intelligent_error_recovery
 * GDI: 68.1
 * 触发信号: timeout, rate limit, 502, 503, network error
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加更多便捷方法
 */

/**
 * @typedef {Object} RecoveryOptions
 * @property {number} maxRetries - 最大重试次数
 * @property {number} baseDelay - 基础延迟(毫秒)
 * @property {boolean} jitter - 是否添加抖动
 * @property {number} failureThreshold - 熔断阈值
 * @property {number} circuitResetTime - 熔断重置时间
 * @property {string[]} fallbackEndpoints - 降级端点列表
 * @property {number} cacheTTL - 缓存TTL(毫秒)
 */

/**
 * @typedef {Object} CachedItem
 * @property {any} value - 缓存值
 * @property {number} timestamp - 时间戳
 */

class SmartErrorRecovery {
  /**
   * @param {RecoveryOptions} options - 配置选项
   */
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.jitter = options.jitter !== false;
    this.failureThreshold = options.failureThreshold || 5;
    this.circuitResetTime = options.circuitResetTime || 30000;
    
    // 熔断器
    this.failureCount = 0;
    this.circuitOpen = false;
    this.circuitOpenTime = null;
    
    // 降级端点
    this.fallbackEndpoints = options.fallbackEndpoints || [];
    this.currentEndpointIndex = 0;
    
    // 缓存
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 60000;
  }

  /**
   * 指数退避+抖动
   * @param {number} attempt - 尝试次数
   * @returns {number} 延迟时间
   */
  getDelay(attempt) {
    const delay = this.baseDelay * Math.pow(2, attempt);
    if (this.jitter) {
      return delay + (Math.random() * 0.5 - 0.25) * delay;
    }
    return delay;
  }

  // 检查是否可重试
  isRetryable(error) {
    if (!error) return false;
    const str = String(error);
    return /timeout|ECONNRESET|ECONNREFUSED|429|502|503|504|network/i.test(str);
  }

  // 解析 Retry-After 头
  parseRetryAfter(headers) {
    const retryAfter = headers['retry-after'] || headers['retry-after'];
    if (retryAfter) {
      const delay = parseInt(retryAfter);
      if (!isNaN(delay)) return delay * 1000;
    }
    return null;
  }

  // 熔断器检查
  canProceed() {
    if (!this.circuitOpen) return true;
    
    if (Date.now() - this.circuitOpenTime > this.circuitResetTime) {
      this.circuitOpen = false;
      this.failureCount = 0;
      return true;
    }
    return false;
  }

  // 记录失败
  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.circuitOpen = true;
      this.circuitOpenTime = Date.now();
    }
  }

  // 记录成功
  recordSuccess() {
    this.failureCount = 0;
    this.circuitOpen = false;
  }

  // 降级处理
  async tryFallback() {
    if (this.fallbackEndpoints.length === 0) {
      throw new Error('No fallback available');
    }
    
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.fallbackEndpoints.length;
    return this.fallbackEndpoints[this.currentEndpointIndex];
  }

  // 缓存获取
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.value;
    }
    return null;
  }

  // 缓存设置
  setCached(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  // 主执行
  async execute(fn, options = {}) {
    const { cacheKey, fallbackFn } = options;
    
    // 检查缓存
    if (cacheKey) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }
    
    // 检查熔断器
    if (!this.canProceed()) {
      // 尝试降级
      if (fallbackFn) {
        return await fallbackFn();
      }
      throw new Error('Circuit breaker open');
    }
    
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await fn();
        this.recordSuccess();
        
        // 缓存结果
        if (cacheKey) {
          this.setCached(cacheKey, result);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // 解析 Retry-After
        if (error.headers) {
          const retryAfter = this.parseRetryAfter(error.headers);
          if (retryAfter) {
            await new Promise(r => setTimeout(r, retryAfter));
          }
        }
        
        if (!this.isRetryable(error.message)) {
          this.recordFailure();
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, this.getDelay(attempt)));
        }
        
        this.recordFailure();
      }
    }
    
    // 尝试降级
    if (fallbackFn) {
      return await fallbackFn();
    }
    
    throw lastError;
  }
}

module.exports = { SmartErrorRecovery };

/**
 * 便捷函数：创建错误恢复实例
 * @param {RecoveryOptions} options - 配置选项
 * @returns {SmartErrorRecovery}
 */
const createRecovery = (options) => new SmartErrorRecovery(options);

/**
 * 便捷函数：检查是否可重试
 * @param {Error|string} error - 错误
 * @returns {boolean}
 */
const isRetryable = (error) => {
  if (!error) return false;
  const str = String(error);
  return /timeout|ECONNRESET|ECONNREFUSED|429|502|503|504|network/i.test(str);
};

module.exports = {
  SmartErrorRecovery,
  createRecovery,
  isRetryable
};
