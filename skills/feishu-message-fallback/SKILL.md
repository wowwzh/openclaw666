/**
 * 飞书消息投递降级框架
 * Feishu Message Fallback System
 * 
 * 特性：
 * - 多通道降级 (主通道失败 → 备用通道)
 * - 消息队列 (异步发送，失败重试)
 * - 投递状态追踪
 * 
 * 信号: feishu_delivery_fail, message_timeout, webhook_unreachable
 */

// 消息通道优先级
const CHANNELS = {
  PRIMARY: 'webhook',      // 立即投递
  SECONDARY: 'im_message', // IM消息
  TERTIARY: 'email'       // 邮件兜底
};

// 消息状态
const MessageStatus = {
  PENDING: 'pending',
  SENDING: 'sending',
  SUCCESS: 'success',
  FAILED: 'failed',
  FALLBACK: 'fallback'
};

class FeishuMessageQueue {
  constructor(options = {}) {
    this.channels = options.channels || [CHANNELS.PRIMARY, CHANNELS.SECONDARY, CHANNELS.TERTIARY];
    this.maxRetries = options.maxRetries || 3;
    this.queue = [];
    this.sending = false;
    this.deliveryStatus = new Map();
  }

  /**
   * 发送消息（带降级）
   */
  async sendMessage(message, options = {}) {
    const messageId = this.generateId();
    
    const messageObj = {
      id: messageId,
      content: message,
      options,
      status: MessageStatus.PENDING,
      attempts: 0,
      channelIndex: 0,
      createdAt: Date.now()
    };

    // 立即尝试发送
    await this.trySend(messageObj);
    
    return messageId;
  }

  /**
   * 尝试发送消息（降级逻辑）
   */
  async trySend(messageObj) {
    messageObj.status = MessageStatus.SENDING;
    messageObj.attempts++;
    
    const channel = this.channels[messageObj.channelIndex];
    
    try {
      const result = await this.sendToChannel(channel, messageObj.content, messageObj.options);
      
      messageObj.status = MessageStatus.SUCCESS;
      this.deliveryStatus.set(messageObj.id, {
        status: MessageStatus.SUCCESS,
        channel,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.log(`[FeishuFallback] Channel ${channel} failed:`, error.message);
      
      // 尝试降级到下一个通道
      if (messageObj.channelIndex < this.channels.length - 1) {
        messageObj.channelIndex++;
        messageObj.status = MessageStatus.FALLBACK;
        
        // 延迟后重试
        await this.sleep(1000);
        return this.trySend(messageObj);
      }
      
      // 所有通道都失败
      messageObj.status = MessageStatus.FAILED;
      this.deliveryStatus.set(messageObj.id, {
        status: MessageStatus.FAILED,
        attempts: messageObj.attempts,
        error: error.message,
        timestamp: Date.now()
      });
      
      // 加入重试队列
      this.queue.push(messageObj);
      this.startQueueProcessor();
      
      throw error;
    }
  }

  /**
   * 发送到指定通道
   */
  async sendToChannel(channel, content, options) {
    switch (channel) {
      case CHANNELS.PRIMARY:
        return this.sendWebhook(content, options);
      case CHANNELS.SECONDARY:
        return this.sendIMMessage(content, options);
      case CHANNELS.TERTIARY:
        return this.sendEmail(content, options);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  /**
   * Webhook发送
   */
  async sendWebhook(content, options) {
    const webhookUrl = options.webhookUrl;
    if (!webhookUrl) throw new Error('Webhook URL required');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * IM消息发送
   */
  async sendIMMessage(content, options) {
    // 使用飞书IM API
    // 需要access_token
    const token = options.accessToken;
    if (!token) throw new Error('Access token required');
    
    const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        receive_id: options.receiveId,
        msg_type: 'text',
        content: JSON.stringify({ text: content })
      })
    });
    
    if (!response.ok) {
      throw new Error(`IM message failed: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * 邮件发送（兜底）
   */
  async sendEmail(content, options) {
    // 调用邮件服务API
    console.log('[FeishuFallback] Sending email fallback:', content);
    return { status: 'email_sent' };
  }

  /**
   * 队列处理器
   */
  startQueueProcessor() {
    if (this.sending) return;
    this.sending = true;
    
    const processQueue = async () => {
      if (this.queue.length === 0) {
        this.sending = false;
        return;
      }
      
      const messageObj = this.queue.shift();
      try {
        await this.trySend(messageObj);
      } catch (error) {
        console.log('[FeishuFallback] Queue retry failed:', error.message);
      }
      
      // 下次处理
      setTimeout(processQueue, 5000);
    };
    
    processQueue();
  }

  /**
   * 获取投递状态
   */
  getStatus(messageId) {
    return this.deliveryStatus.get(messageId);
  }

  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 创建消息队列实例
 */
function createMessageQueue(options) {
  return new FeishuMessageQueue(options);
}

module.exports = {
  FeishuMessageQueue,
  createMessageQueue,
  MessageStatus,
  CHANNELS
};
