/**
 * API网关系统
 * API Gateway System
 * 
 * 特性：
 * - 请求路由
 * - 负载均衡
 * - 限流熔断
 * - 认证授权
 * - 监控日志
 * 
 * 信号: api_gateway, load_balancing, rate_limiting
 */

class APIGateway {
  constructor(options = {}) {
    this.routes = new Map();
    this.services = new Map();
    this.middlewares = [];
    this.rateLimiter = options.rateLimiter || null;
    this.circuitBreaker = options.circuitBreaker || null;
    this.metrics = {
      requests: 0,
      errors: 0,
      latency: []
    };
  }

  /**
   * 注册路由
   */
  route(path, options = {}) {
    return (target, handler) => {
      this.routes.set(path, {
        path,
        method: options.method || 'GET',
        handler,
        target,
        auth: options.auth || false,
        rateLimit: options.rateLimit,
        timeout: options.timeout || 30000
      });
    };
  }

  /**
   * 注册服务
   */
  registerService(name, endpoints) {
    this.services.set(name, {
      name,
      endpoints,
      healthy: true,
      lastCheck: Date.now()
    });
  }

  /**
   * 添加中间件
   */
  use(middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * 处理请求
   */
  async handle(request) {
    const startTime = Date.now();
    this.metrics.requests++;
    
    try {
      // 限流检查
      if (this.rateLimiter) {
        const allowed = await this.rateLimiter.check(request);
        if (!allowed) {
          return this.error(429, 'Rate limit exceeded');
        }
      }
      
      // 路由匹配
      const route = this.matchRoute(request);
      if (!route) {
        return this.error(404, 'Route not found');
      }
      
      // 认证检查
      if (route.auth) {
        const authorized = await this.authenticate(request);
        if (!authorized) {
          return this.error(401, 'Unauthorized');
        }
      }
      
      // 执行中间件
      for (const middleware of this.middlewares) {
        await middleware(request);
      }
      
      // 熔断检查
      if (this.circuitBreaker) {
        const allowed = await this.circuitBreaker.check(route.target);
        if (!allowed) {
          return this.error(503, 'Service unavailable');
        }
      }
      
      // 负载均衡选择服务
      const service = await this.selectService(route.target);
      
      // 超时控制
      const response = await this.withTimeout(
        this.proxy(service, request),
        route.timeout
      );
      
      // 记录延迟
      this.metrics.latency.push(Date.now() - startTime);
      
      return response;
      
    } catch (error) {
      this.metrics.errors++;
      return this.error(500, error.message);
    }
  }

  /**
   * 路由匹配
   */
  matchRoute(request) {
    const path = request.path;
    for (const [routePath, route] of this.routes) {
      if (this.matchPath(routePath, path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * 路径匹配
   */
  matchPath(pattern, path) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(path);
  }

  /**
   * 认证
   */
  async authenticate(request) {
    const token = request.headers?.authorization;
    return !!token;
  }

  /**
   * 选择服务（负载均衡）
   */
  async selectService(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    
    // 简单轮询
    const index = Math.floor(Date.now() / 1000) % service.endpoints.length;
    return service.endpoints[index];
  }

  /**
   * 代理请求
   */
  async proxy(service, request) {
    const response = await fetch(service + request.path, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    return {
      status: response.status,
      body: await response.json()
    };
  }

  /**
   * 超时控制
   */
  withTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  /**
   * 错误响应
   */
  error(status, message) {
    return { status, body: { error: message } };
  }

  /**
   * 获取指标
   */
  getMetrics() {
    const avgLatency = this.metrics.latency.length > 0
      ? this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length
      : 0;
    
    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      avgLatency: avgLatency.toFixed(2) + 'ms',
      errorRate: ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
    };
  }
}

/**
 * 创建API网关
 */
function createAPIGateway(options) {
  return new APIGateway(options);
}

module.exports = {
  APIGateway,
  createAPIGateway
};
