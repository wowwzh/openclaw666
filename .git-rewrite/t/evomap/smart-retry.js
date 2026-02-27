/**
 * 智能重试框架 (Smart Retry Framework)
 * 基于EvoMap热门Capsule学习的HTTP重试实现
 * 支持：指数退避、熔断器、限流检测
 */

const http = require('http');
const https = require('https');

class SmartRetry {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.retryableErrors = options.retryableErrors || [
      'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND',
      'timeout', 'EAI_AGAIN', 'socket hang up'
    ];
    
    // 熔断器状态
    this.circuitState = 'closed'; // closed, open, half-open
    this.circuitFailureCount = 0;
    this.circuitSuccessCount = 0;
    this.circuitThreshold = 5; // 失败5次打开熔断
    this.circuitTimeout = 30000; // 30秒后尝试半开
    
    // 限流检测
    this.rateLimitDetected = false;
    this.rateLimitDelay = 5000;
  }
  
  // 判断是否可重试的错误
  isRetryable(error) {
    const errorStr = String(error).toLowerCase();
    return this.retryableErrors.some(e => errorStr.includes(e.toLowerCase()));
  }
  
  // 计算延迟（指数退避 + 抖动）
  calculateDelay(attempt) {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, attempt),
      this.maxDelay
    );
    // 添加随机抖动 (±25%)
    const jitter = delay * 0.25 * Math.random();
    return delay + jitter;
  }
  
  // 检查熔断器状态
  checkCircuit() {
    if (this.circuitState === 'open') {
      // 检查是否超时
      if (this.circuitFailureCount >= this.circuitThreshold) {
        this.circuitState = 'half-open';
        console.log('[SmartRetry] 熔断器进入半开状态');
        return true; // 允许尝试
      }
      return false; // 阻止请求
    }
    return true; // 关闭状态，允许请求
  }
  
  // 记录失败
  recordFailure() {
    this.circuitFailureCount++;
    if (this.circuitFailureCount >= this.circuitThreshold) {
      this.circuitState = 'open';
      console.log('[SmartRetry] 熔断器打开');
    }
  }
  
  // 记录成功
  recordSuccess() {
    this.circuitSuccessCount++;
    if (this.circuitState === 'half-open' && this.circuitSuccessCount >= 3) {
      this.circuitState = 'closed';
      this.circuitFailureCount = 0;
      this.circuitSuccessCount = 0;
      console.log('[SmartRetry] 熔断器关闭');
    }
  }
  
  // 智能重试请求
  async request(url, options = {}) {
    if (!this.checkCircuit()) {
      throw new Error('Circuit breaker is open, please wait');
    }
    
    const method = options.method || 'GET';
    const headers = options.headers || {};
    const body = options.body;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.executeRequest(url, { method, headers, body });
        
        // 检查429限流
        if (response.statusCode === 429) {
          this.rateLimitDetected = true;
          const retryAfter = response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.rateLimitDelay;
          
          if (attempt < this.maxRetries) {
            console.log(`[SmartRetry] 检测到限流，等待 ${delay}ms`);
            await this.sleep(delay);
            continue;
          }
        }
        
        // 2xx 成功
        if (response.statusCode >= 200 && response.statusCode < 300) {
          this.recordSuccess();
          return response;
        }
        
        // 其他错误
        const error = new Error(`HTTP ${response.statusCode}`);
        if (this.isRetryable(error) && attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt);
          console.log(`[SmartRetry] 错误 ${response.statusCode}，${delay}ms后重试 (${attempt + 1}/${this.maxRetries})`);
          await this.sleep(delay);
          continue;
        }
        
        this.recordFailure();
        throw error;
        
      } catch (error) {
        if (this.isRetryable(error) && attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt);
          console.log(`[SmartRetry] ${error.message}，${delay}ms后重试 (${attempt + 1}/${this.maxRetries})`);
          await this.sleep(delay);
        } else {
          this.recordFailure();
          throw error;
        }
      }
    }
    
    this.recordFailure();
    throw new Error('Max retries exceeded');
  }
  
  // 执行实际请求
  executeRequest(url, options) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          res.body = data;
          resolve(res);
        });
      });
      
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (options.body) req.write(options.body);
      req.end();
    });
  }
  
  // 睡眠
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 获取状态
  getStatus() {
    return {
      circuitState: this.circuitState,
      failureCount: this.circuitFailureCount,
      successCount: this.circuitSuccessCount,
      rateLimitDetected: this.rateLimitDetected
    };
  }
}

module.exports = { SmartRetry };
