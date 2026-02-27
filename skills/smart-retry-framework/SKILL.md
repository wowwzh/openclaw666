/**
 * Smart HTTP Retry Framework
 * 智能HTTP重试框架 - 集成EvoMap热门资产的核心理念
 * 
 * 特性：
 * - 指数退避 (Exponential Backoff)
 * - 连接池管理 (Connection Pooling)
 * - 限流检测 (Rate Limit Detection)
 * - 熔断器模式 (Circuit Breaker)
 * 
 * 信号: TimeoutError, ECONNRESET, 429TooManyRequests, ETIMEDOUT
 */

class SmartRetry {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 基础延迟 ms
    this.maxDelay = options.maxDelay || 30000;  // 最大延迟 ms
    this.retryableErrors = options.retryableErrors || [
      'ETIMEDOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      '429',
      'timeout',
      'network'
    ];
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5; // 熔断阈值
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 60000; // 熔断恢复时间
    this.requestPool = new Map(); // 连接池
    this.circuitState = 'closed'; // closed, open, half-open
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * 计算指数退避延迟
   */
  calculateBackoff(attempt) {
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // 添加随机抖动
    return Math.min(exponentialDelay + jitter, this.maxDelay);
  }

  /**
   * 检查是否可重试
   */
  isRetryable(error) {
    const errorStr = String(error).toLowerCase();
    return this.retryableErrors.some(e => errorStr.includes(e.toLowerCase()));
  }

  /**
   * 检查熔断器状态
   */
  checkCircuitBreaker() {
    if (this.circuitState === 'open') {
      if (Date.now() - this.lastFailureTime > this.circuitBreakerTimeout) {
        this.circuitState = 'half-open';
        return true;
      }
      return false;
    }
    return true;
  }

 记录失败
   */
  /**
   *  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitState = 'open';
    }
  }

  /**
   * 记录成功
   */
  recordSuccess() {
    this.failureCount = 0;
    this.circuitState = 'closed';
  }

  /**
   * 执行带重试的请求
   */
  async execute(requestFn) {
    if (!this.checkCircuitBreaker()) {
      throw new Error('Circuit breaker is open');
    }

    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await requestFn();
        this.recordSuccess();
        return result;
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryable(error)) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          console.log(`[SmartRetry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    this.recordFailure();
    throw lastError;
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 从连接池获取连接
   */
  async getConnection(key) {
    if (!this.requestPool.has(key)) {
      this.requestPool.set(key, {
        count: 0,
        lastUsed: Date.now()
      });
    }
    const conn = this.requestPool.get(key);
    conn.count++;
    conn.lastUsed = Date.now();
    return conn;
  }

  /**
   * 清理连接池
   */
  cleanPool(maxAge = 300000) {
    const now = Date.now();
    for (const [key, conn] of this.requestPool) {
      if (now - conn.lastUsed > maxAge) {
        this.requestPool.delete(key);
      }
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      circuitState: this.circuitState,
      failureCount: this.failureCount,
      poolSize: this.requestPool.size,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * 创建智能重试实例
 */
function createSmartRetry(options) {
  return new SmartRetry(options);
}

/**
 * 带重试的fetch封装
 */
async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const retry = new SmartRetry(retryOptions);
  
  return retry.execute(async () => {
    const response = await fetch(url, {
      ...options,
      signal: retryOptions.abortSignal
    });
    
    // 检查429限流
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
      }
      throw new Error('Rate limited');
    }
    
    return response;
  });
}

module.exports = {
  SmartRetry,
  createSmartRetry,
  fetchWithRetry
};
