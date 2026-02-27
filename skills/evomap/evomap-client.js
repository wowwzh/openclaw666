/**
 * EvoMap A2A 协议客户端
 * 简化与 EvoMap 平台的交互
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加更多便捷方法
 * - 改进错误处理
 */

const crypto = require('crypto');

/**
 * @typedef {Object} ClientOptions
 * @property {string} baseUrl - 基础URL
 * @property {string} nodeId - 节点ID
 * @property {number} timeout - 请求超时(毫秒)
 * @property {boolean} debug - 调试模式
 */

/**
 * @typedef {Object} Envelope
 * @property {string} protocol - 协议名
 * @property {string} protocol_version - 协议版本
 * @property {string} message_type - 消息类型
 * @property {string} message_id - 消息ID
 * @property {string} sender_id - 发送者ID
 * @property {string} timestamp - 时间戳
 * @property {Object} payload - 负载
 */

class EvoMapClient {
  /**
   * @param {ClientOptions} options - 配置选项
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://evomap.ai';
    this.nodeId = options.nodeId || this.generateNodeId();
    this.timeout = options.timeout || 30000;
    this.debug = options.debug || false;
  }
  
  // 生成节点ID
  generateNodeId() {
    return `node_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
  
  // 生成消息ID
  generateMessageId() {
    return `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
  
  // 构建协议信封
  buildEnvelope(messageType, payload = {}) {
    return {
      protocol: 'gep-a2a',
      protocol_version: '1.0.0',
      message_type: messageType,
      message_id: this.generateMessageId(),
      sender_id: this.nodeId,
      timestamp: new Date().toISOString(),
      payload
    };
  }
  
  // 注册节点
  async hello(capabilities = {}, geneCount = 0, capsuleCount = 0) {
    const envelope = this.buildEnvelope('hello', {
      capabilities,
      gene_count: geneCount,
      capsule_count: capsuleCount,
      env_fingerprint: {
        platform: 'windows',
        arch: 'x64'
      }
    });
    
    return this.request('/a2a/hello', envelope);
  }
  
  // 发布Capsule
  async publish(capsule) {
    const envelope = this.buildEnvelope('publish', {
      name: capsule.name,
      description: capsule.description,
      gene: capsule.gene,
      asset_id: capsule.assetId,
      tags: capsule.tags || []
    });
    
    return this.request('/a2a/publish', envelope);
  }
  
  // 获取资源
  async fetch(query, options = {}) {
    const envelope = this.buildEnvelope('fetch', {
      query,
      filters: options.filters || {},
      limit: options.limit || 10
    });
    
    return this.request('/a2a/fetch', envelope);
  }
  
  // 报告验证
  async report(capsuleId, validationResult) {
    const envelope = this.buildEnvelope('report', {
      capsule_id: capsuleId,
      gdi_score: validationResult.gdiScore,
      confidence: validationResult.confidence,
      success_streak: validationResult.successStreak,
      intrinsic: validationResult.intrinsic
    });
    
    return this.request('/a2a/report', envelope);
  }
  
  // HTTP请求
  async request(endpoint, data) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
  
  // 计算 asset_id (sha256 of canonical JSON)
  calculateAssetId(obj) {
    const canonicalJson = JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {}));
    
    return crypto.createHash('sha256').update(canonicalJson).digest('hex');
  }
}

module.exports = { EvoMapClient };

/**
 * 便捷函数：创建EvoMap客户端实例
 * @param {ClientOptions} options - 配置选项
 * @returns {EvoMapClient}
 */
const createClient = (options) => new EvoMapClient(options);

/**
 * 便捷函数：计算asset ID
 * @param {Object} obj - 对象
 * @returns {string} SHA256哈希
 */
const calculateAssetId = (obj) => {
  const canonicalJson = JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {}));
  return 'sha256:' + crypto.createHash('sha256').update(canonicalJson).digest('hex');
};

module.exports = {
  EvoMapClient,
  createClient,
  calculateAssetId
};
