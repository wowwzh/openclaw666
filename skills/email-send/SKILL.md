/**
 * 邮件发送系统
 * Email Send System
 * 
 * 特性：
 * - SMTP发送
 * - 模板支持
 * - 附件处理
 * - 发送统计
 * 
 * 信号: email_send, smtp, mail
 */

const nodemailer = require('nodemailer');

class EmailSender {
  constructor(options = {}) {
    this.transporter = nodemailer.createTransport({
      host: options.host || process.env.SMTP_HOST,
      port: options.port || 587,
      secure: options.secure || false,
      auth: {
        user: options.user || process.env.SMTP_USER,
        pass: options.pass || process.env.SMTP_PASS
      }
    });

    this.from = options.from || process.env.EMAIL_FROM;
    this.templates = new Map();
    this.stats = {
      sent: 0,
      failed: 0,
      lastSent: null
    };
  }

  /**
   * 发送邮件
   */
  async send(options) {
    const mailOptions = {
      from: options.from || this.from,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
      headers: options.headers
    };

    // 如果有模板，先渲染
    if (options.template) {
      const template = this.templates.get(options.template);
      if (template) {
        const rendered = template(options.data || {});
        mailOptions.html = rendered.html || mailOptions.html;
        mailOptions.text = rendered.text || mailOptions.text;
        mailOptions.subject = rendered.subject || mailOptions.subject;
      }
    }

    try {
      const result = await this.transporter.sendMail(mailOptions);
      this.stats.sent++;
      this.stats.lastSent = Date.now();
      
      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected
      };
    } catch (error) {
      this.stats.failed++;
      throw error;
    }
  }

  /**
   * 批量发送
   */
  async sendBatch(emails, options = {}) {
    const results = [];
    
    for (const email of emails) {
      try {
        const result = await this.send({
          ...options,
          ...email
        });
        results.push({ to: email.to, success: true, result });
      } catch (error) {
        results.push({ to: email.to, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * 注册模板
   */
  registerTemplate(name, template) {
    this.templates.set(name, template);
    return this;
  }

  /**
   * 验证连接
   */
  async verify() {
    return await this.transporter.verify();
  }

  /**
   * 获取统计
   */
  getStats() {
    const total = this.stats.sent + this.stats.failed;
    return {
      ...this.stats,
      total,
      successRate: total > 0 ? ((this.stats.sent / total) * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * 简单模板引擎
   */
  static simpleTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * 创建HTML模板
   */
  static createHtmlTemplate(content, styles = '') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    ${styles}
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;
  }
}

/**
 * 创建邮件发送器
 */
function createEmailSender(options) {
  return new EmailSender(options);
}

module.exports = {
  EmailSender,
  createEmailSender
};
