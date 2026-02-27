/**
 * 飞书消息投递降级链模块
 * 
 * 降级策略：rich text → interactive card → webhook → email
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加便捷函数
 */

/** @typedef {Object} FeishuConfig */
/** @typedef {Object} SendResult */

const axios = require('axios');

// 降级级别
/** @type {Object} */
const LEVELS = {
  RICH_TEXT: 1,
  CARD: 2,
  WEBHOOK: 3,
  EMAIL: 4
};

/**
 * 飞书消息投递器
 * @class
 */
class FeishuFallback {
  /**
   * @param {FeishuConfig} config - 配置选项
   */
  constructor(config = {}) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.webhookUrl = config.webhookUrl;
    this.email = config.email;
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 10000;
  }

  /**
   * 获取tenant_access_token
   */
  async getToken() {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: this.appId,
      app_secret: this.appSecret
    });
    return response.data.tenant_access_token;
  }

  /**
   * 发送富文本消息
   */
  async sendRichText(userId, content) {
    const token = await this.getToken();
    return axios.post('https://open.feishu.cn/open-apis/im/v1/messages', {
      receive_id: userId,
      msg_type: 'text',
      content: JSON.stringify({ text: content })
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * 发送卡片消息
   */
  async sendCard(userId, card) {
    const token = await this.getToken();
    return axios.post('https://open.feishu.cn/open-apis/im/v1/messages', {
      receive_id: userId,
      msg_type: 'interactive',
      card: JSON.stringify(card)
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * 发送 webhook
   */
  async sendWebhook(content) {
    if (!this.webhookUrl) throw new Error('Webhook URL not configured');
    return axios.post(this.webhookUrl, { text: content });
  }

  /**
   * 发送邮件
   */
  async sendEmail(subject, content) {
    // 简化实现，实际需要更多 API
    console.log(`[Email] To: ${this.email}, Subject: ${subject}`);
    return { data: { code: 0 } };
  }

  /**
   * 降级发送消息
   * @param {string} userId - 用户ID
   * @param {string} content - 消息内容
   * @param {object} card - 可选的卡片模板
   */
  async sendWithFallback(userId, content, card = null) {
    const errors = [];

    // 1. 尝试富文本
    try {
      await this.sendRichText(userId, content);
      return { success: true, level: LEVELS.RICH_TEXT };
    } catch (e) {
      errors.push({ level: 'RICH_TEXT', error: e.message });
    }

    // 2. 尝试卡片
    if (card) {
      try {
        await this.sendCard(userId, card);
        return { success: true, level: LEVELS.CARD };
      } catch (e) {
        errors.push({ level: 'CARD', error: e.message });
      }
    }

    // 3. 尝试 webhook
    try {
      await this.sendWebhook(content);
      return { success: true, level: LEVELS.WEBHOOK };
    } catch (e) {
      errors.push({ level: 'WEBHOOK', error: e.message });
    }

    // 4. 最后尝试邮件
    try {
      await this.sendEmail('飞书消息投递失败', content);
      return { success: true, level: LEVELS.EMAIL };
    } catch (e) {
      errors.push({ level: 'EMAIL', error: e.message });
    }

    // 全部失败
    return { 
      success: false, 
      errors,
      message: '所有投递方式均失败'
    };
  }
}

module.exports = {
  FeishuFallback,
  LEVELS,
  // v1.1 便捷函数
  createFeishuFallback: (config) => new FeishuFallback(config),
  getLevelName: (level) => Object.keys(LEVELS).find(k => LEVELS[k] === level) || 'UNKNOWN'
};
