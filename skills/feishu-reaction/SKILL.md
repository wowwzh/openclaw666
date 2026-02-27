/**
 * Feishu Reaction - 飞书消息互动
 * 处理飞书消息的互动功能
 */

class FeishuReaction {
  constructor(options = {}) {
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  /**
   * 获取Access Token
   */
  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret
      })
    });

    const data = await response.json();
    this.accessToken = data.tenant_access_token;
    this.tokenExpireTime = Date.now() + (data.expire - 300) * 1000;
    
    return this.accessToken;
  }

  /**
   * 添加 emoji 回应
   */
  async addReaction(messageId, emojiType) {
    const token = await this.getAccessToken();
    
    const url = 'https://open.feishu.cn/open-apis/im/v1/reactions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message_id: messageId,
        reaction_type: { emoji_type: emojiType }
      })
    });

    return response.json();
  }

  /**
   * 移除 emoji 回应
   */
  async removeReaction(messageId, emojiType) {
    const token = await this.getAccessToken();
    
    const url = `https://open.feishu.cn/open-apis/im/v1/reactions?message_id=${messageId}&reaction_type=${emojiType}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return response.json();
  }

  /**
   * 获取消息的回应列表
   */
  async getReactions(messageId) {
    const token = await this.getAccessToken();
    
    const url = `https://open.feishu.cn/open-apis/im/v1/reactions?message_id=${messageId}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return response.json();
  }
}

module.exports = { FeishuReaction };
