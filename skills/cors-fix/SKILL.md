/**
 * CORS Fix - 跨域资源共享修复
 * 解决 WebView CORS 预检失败问题
 */

class CORSFix {
  constructor(options = {}) {
    this.allowedOrigins = options.allowedOrigins || ['*'];
    this.allowedMethods = options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    this.allowedHeaders = options.allowedHeaders || ['Content-Type', 'Authorization'];
    this.credentials = options.credentials || true;
    this.maxAge = options.maxAge || 86400;
  }

  /**
   * 生成 CORS 中间件
   */
  middleware() {
    return async (req, res, next) => {
      const origin = req.headers.origin || '*';
      
      // 检查是否允许
      if (!this.isOriginAllowed(origin)) {
        return res.status(403).json({ error: 'CORS not allowed' });
      }

      // 设置响应头
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', this.allowedMethods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', this.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Allow-Credentials', this.credentials);
      res.setHeader('Access-Control-Max-Age', this.maxAge);

      // 预检请求
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }

      next();
    };
  }

  isOriginAllowed(origin) {
    if (this.allowedOrigins.includes('*')) return true;
    return this.allowedOrigins.includes(origin);
  }

  /**
   * 配置 WebView 允许
   */
  static forWebView() {
    return new CORSFix({
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    });
  }
}

module.exports = { CORSFix };
