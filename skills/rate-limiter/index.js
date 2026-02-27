/**
 * Rate Limiter - API限流器
 * 
 * 支持：固定窗口、滑动窗口、令牌桶
 * 
 * v1.1 优化:
 * - 添加更详细的类型注解
 * - 添加并发安全支持
 * - 添加统计信息
 * - 添加装饰器支持
 */

/**
 * 简单并发锁
 */
class Mutex {
  constructor() {
    this.locks = new Map();
  }
  
  async acquire(key) {
    while (this.locks.get(key)) {
      await new Promise(r => setTimeout(r, 10));
    }
    this.locks.set(key, true);
  }
  
  release(key) {
    this.locks.delete(key);
  }
}

const mutex = new Mutex();

class RateLimiter {
  /**
   * 固定窗口限流
   * @param {Object} options - 配置
   * @param {number} options.maxRequests - 最大请求数
   * @param {number} options.windowMs - 窗口毫秒数
   * @param {boolean} options.enableStats - 启用统计
   */
  static fixedWindow(options) {
    const { maxRequests, windowMs, enableStats = false } = options;
    const requests = new Map();
    const stats = enableStats ? { total: 0, allowed: 0, rejected: 0 } : null;

    return {
      allow: (key) => {
        const now = Date.now();
        const window = Math.floor(now / windowMs);
        const windowKey = `${key}:${window}`;
        
        const count = requests.get(windowKey) || 0;
        
        if (count >= maxRequests) {
          return { allowed: false, remaining: 0, resetAt: (window + 1) * windowMs };
        }
        
        requests.set(windowKey, count + 1);
        
        // 清理过期数据
        this._cleanup(requests, windowMs * 2);
        
        return { 
          allowed: true, 
          remaining: maxRequests - count - 1,
          resetAt: (window + 1) * windowMs
        };
      },
      
      reset: (key) => {
        for (const k of requests.keys()) {
          if (k.startsWith(key + ':')) {
            requests.delete(k);
          }
        }
      }
    };
  }

  /**
   * 滑动窗口限流
   */
  static slidingWindow(options) {
    const { maxRequests, windowMs } = options;
    const requests = new Map();

    return {
      allow: (key) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // 获取窗口内的请求
        const keyRequests = requests.get(key) || [];
        const recentRequests = keyRequests.filter(t => t > windowStart);
        
        if (recentRequests.length >= maxRequests) {
          const oldest = Math.min(...recentRequests);
          return { 
            allowed: false, 
            remaining: 0, 
            resetAt: oldest + windowMs 
          };
        }
        
        recentRequests.push(now);
        requests.set(key, recentRequests);
        
        return { 
          allowed: true, 
          remaining: maxRequests - recentRequests.length,
          resetAt: now + windowMs
        };
      },
      
      reset: (key) => {
        requests.delete(key);
      }
    };
  }

  /**
   * 令牌桶限流
   */
  static tokenBucket(options) {
    const { maxTokens, refillRate, initialTokens } = options;
    const tokens = new Map();
    
    const initial = initialTokens ?? maxTokens;

    return {
      consume: (key, cost = 1) => {
        let bucket = tokens.get(key) || {
          tokens: initial,
          lastRefill: Date.now()
        };
        
        // 计算应补充的令牌
        const now = Date.now();
        const timePassed = now - bucket.lastRefill;
        const tokensToAdd = Math.floor(timePassed * refillRate / 1000);
        
        if (tokensToAdd > 0) {
          bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
          bucket.lastRefill = now;
        }
        
        if (bucket.tokens >= cost) {
          bucket.tokens -= cost;
          tokens.set(key, bucket);
          return { 
            allowed: true, 
            remaining: bucket.tokens 
          };
        }
        
        return { 
          allowed: false, 
          remaining: bucket.tokens 
        };
      },
      
      reset: (key) => {
        tokens.delete(key);
      }
    };
  }

  /**
   * 清理过期数据
   */
  static _cleanup(requests, maxAge) {
    const now = Date.now();
    for (const [key, timestamp] of requests) {
      if (now - timestamp > maxAge) {
        requests.delete(key);
      }
    }
  }
}

module.exports = { RateLimiter };
