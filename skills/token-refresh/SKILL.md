/**
 * 自动Token刷新系统
 * Automatic Token Refresh System
 * 
 * 特性：
 * - 自动检测过期
 * - 静默刷新
 * - 错误恢复
 * - 并发控制
 * 
 * 信号: token_refresh, auth_failure, session_expiry
 */

class TokenRefresh {
  constructor(options = {}) {
    this.refreshFn = options.refreshFn;
    this.tokenKey = options.tokenKey || 'auth_token';
    this.refreshBefore = options.refreshBefore || 300; // 提前5分钟刷新
    this.retryCount = options.retryCount || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.currentToken = null;
    this.tokenExpiresAt = null;
    this.refreshing = false;
    this.queue = [];
  }

  /**
   * 初始化
   */
  async init() {
    // 从存储加载token
    const stored = await this.loadToken();
    if (stored) {
      this.currentToken = stored.token;
      this.tokenExpiresAt = stored.expiresAt;
    }
    return this.getToken();
  }

  /**
   * 获取Token（自动刷新）
   */
  async getToken() {
    // 检查是否需要刷新
    if (this.shouldRefresh()) {
      return this.refresh();
    }
    return this.currentToken;
  }

  /**
   * 检查是否需要刷新
   */
  shouldRefresh() {
    if (!this.currentToken) return true;
    if (!this.tokenExpiresAt) return true;
    const now = Date.now();
    return now >= this.tokenExpiresAt - (this.refreshBefore * 1000);
  }

  /**
   * 刷新Token
   */
  async refresh() {
    // 如果正在刷新，等待
    if (this.refreshing) {
      return new Promise(resolve => {
        this.queue.push(resolve);
      });
    }

    this.refreshing = true;

    try {
      for (let i = 0; i < this.retryCount; i++) {
        try {
          const newToken = await this.refreshFn();
          
          if (newToken) {
            this.currentToken = newToken;
            // 假设token有效期为1小时
            this.tokenExpiresAt = Date.now() + 3600000;
            
            // 保存到存储
            await this.saveToken({
              token: this.currentToken,
              expiresAt: this.tokenExpiresAt
            });
          }
          
          break;
        } catch (error) {
          if (i === this.retryCount - 1) throw error;
          await this.sleep(this.retryDelay * (i + 1));
        }
      }
    } finally {
      this.refreshing = false;
      
      // 唤醒等待的请求
      for (const resolve of this.queue) {
        resolve(this.currentToken);
      }
      this.queue = [];
    }

    return this.currentToken;
  }

  /**
   * 强制刷新
   */
  async forceRefresh() {
    this.tokenExpiresAt = 0;
    return this.refresh();
  }

  /**
   * 清除Token
   */
  async clearToken() {
    this.currentToken = null;
    this.tokenExpiresAt = null;
    await this.removeToken();
  }

  /**
   * 加载Token（子类实现）
   */
  async loadToken() {
    return null;
  }

  /**
   * 保存Token（子类实现）
   */
  async saveToken() {}

  /**
   * 删除Token（子类实现）
   */
  async removeToken() {}

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 带存储的Token刷新
 */
class StoredTokenRefresh extends TokenRefresh {
  constructor(options = {}) {
    super(options);
    this.storage = options.storage || localStorage;
  }

  async loadToken() {
    try {
      const data = this.storage.getItem(this.tokenKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async saveToken(data) {
    this.storage.setItem(this.tokenKey, JSON.stringify(data));
  }

  async removeToken() {
    this.storage.removeItem(this.tokenKey);
  }
}

/**
 * 创建Token刷新实例
 */
function createTokenRefresh(options) {
  return new TokenRefresh(options);
}

function createStoredTokenRefresh(options) {
  return new StoredTokenRefresh(options);
}

module.exports = {
  TokenRefresh,
  StoredTokenRefresh,
  createTokenRefresh,
  createStoredTokenRefresh
};
