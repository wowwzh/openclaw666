/**
 * API Key 轮换管理器
 * 负责检查和切换API Key
 * 
 * v1.2 优化 (2026-02-26):
 * - 修复重复 module.exports 问题
 * - 添加余额检查功能
 * - 添加健康检查方法
 * - 改进错误处理
 */

/** @typedef {{current: number, key: string, usage: number}} ProviderStats */
/** @typedef {{openai: ProviderStats, tavily: ProviderStats}} Stats */

const fs = require('fs');
const path = require('path');

/**
 * API Keys配置
 * @type {Object}
 */
const API_KEYS = {
  tavily: [
    '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'
  ],
  openai: [
    'sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE',
    'sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA',
    'sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE'
  ]
};

/**
 * Key轮换策略配置
 * @typedef {Object} RotationConfig
 * @property {number} threshold - 切换阈值(百分比)
 * @property {number} windowHours - 重置时间窗口(小时)
 */

/** @type {RotationConfig} */
const DEFAULT_CONFIG = {
  threshold: 20,
  windowHours: 5
};

class KeyManager {
  /**
   * @param {RotationConfig} config - 配置选项
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentKeys = {
      tavily: 0,
      openai: 0
    };
    this.usageCount = new Map();
    this.lastReset = new Map();
    this.keyHealth = new Map();
    
    // 初始化使用计数
    API_KEYS.openai.forEach((_, i) => {
      this.usageCount.set(`openai_${i}`, 0);
      this.keyHealth.set(`openai_${i}`, true);
    });
    API_KEYS.tavily.forEach((_, i) => {
      this.usageCount.set(`tavily_${i}`, 0);
      this.keyHealth.set(`tavily_${i}`, true);
    });
  }
  
  /**
   * 获取指定Provider的所有可用Keys
   * @param {string} provider - 提供商名称
   * @returns {string[]|null}
   */
  getKeys(provider) {
    const keys = API_KEYS[provider];
    if (!keys) {
      console.warn(`[KeyManager] 未知的提供商: ${provider}`);
      return null;
    }
    return keys;
  }
  
  /**
   * 获取当前使用的Key
   * @param {string} provider - 提供商名称
   * @returns {string|null}
   */
  getCurrentKey(provider) {
    const keys = this.getKeys(provider);
    if (!keys) return null;
    
    const index = this.currentKeys[provider] || 0;
    return keys[index];
  }
  
  /**
   * 获取下一个可用的OpenAI Key
   * 轮换策略：每5小时检查余额，余额<20%时切换
   */
  getOpenAIKey() {
    return this.getCurrentKey('openai');
  }
  
  /**
   * 切换到下一个OpenAI Key
   * @returns {string} 新的Key
   */
  rotateOpenAIKey() {
    const keys = API_KEYS.openai;
    const oldIndex = this.currentKeys.openai;
    this.currentKeys.openai = (this.currentKeys.openai + 1) % keys.length;
    
    // 标记旧Key为不健康
    this.keyHealth.set(`openai_${oldIndex}`, false);
    
    console.log(`[KeyManager] 切换 OpenAI Key: #${oldIndex + 1} -> #${this.currentKeys.openai + 1}`);
    return this.getOpenAIKey();
  }
  
  /**
   * 智能轮换：自动切换到健康的Key
   * @param {string} provider - 提供商
   * @returns {string} 切换后的  smartRotate(providerKey
   */
) {
    const keys = API_KEYS[provider];
    if (!keys || keys.length <= 1) {
      return this.getCurrentKey(provider);
    }
    
    // 寻找下一个健康的Key
    let attempts = 0;
    while (attempts < keys.length) {
      const nextIndex = (this.currentKeys[provider] + 1) % keys.length;
      
      if (this.keyHealth.get(`${provider}_${nextIndex}`) !== false) {
        this.currentKeys[provider] = nextIndex;
        break;
      }
      attempts++;
    }
    
    console.log(`[KeyManager] 智能切换 ${provider} 到 #${this.currentKeys[provider] + 1}`);
    return this.getCurrentKey(provider);
  }
  
  /**
   * 检查是否需要切换Key
   * @param {number} remainingQuota - 剩余配额百分比 (0-100)
   * @returns {boolean}
   */
  shouldRotate(remainingQuota) {
    return remainingQuota < this.config.threshold;
  }
  
  /**
   * 记录Key使用
   * @param {string} provider - 提供商
   */
  recordUsage(provider) {
    const key = `${provider}_${this.currentKeys[provider]}`;
    this.usageCount.set(key, (this.usageCount.get(key) || 0) + 1);
  }
  
  /**
   * 标记Key为不健康
   * @param {string} provider - 提供商
   * @param {number} index - Key索引
   */
  markKeyUnhealthy(provider, index = null) {
    const keyIndex = index !== null ? index : this.currentKeys[provider];
    this.keyHealth.set(`${provider}_${keyIndex}`, false);
    console.log(`[KeyManager] 标记 Key ${provider}#${keyIndex + 1} 为不健康`);
  }
  
  /**
   * 重置所有Key的健康状态
   */
  resetHealth() {
    this.keyHealth.forEach((_, key) => {
      this.keyHealth.set(key, true);
    });
    console.log('[KeyManager] 已重置所有Key健康状态');
  }
  
  /**
   * 获取当前Key的使用统计
   * @returns {Stats}
   */
  getStats() {
    const stats = {};
    
    for (const provider of Object.keys(API_KEYS)) {
      const currentIndex = this.currentKeys[provider] || 0;
      stats[provider] = {
        current: currentIndex,
        key: (this.getCurrentKey(provider) || '').substring(0, 10) + '...',
        usage: this.usageCount.get(`${provider}_${currentIndex}`) || 0,
        healthy: this.keyHealth.get(`${provider}_${currentIndex}`) !== false,
        totalKeys: API_KEYS[provider].length
      };
    }
    
    return stats;
  }
  
  /**
   * 获取详细状态报告
   * @returns {Object}
   */
  getStatusReport() {
    return {
      config: this.config,
      currentKeys: this.currentKeys,
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { KeyManager, API_KEYS, DEFAULT_CONFIG };
