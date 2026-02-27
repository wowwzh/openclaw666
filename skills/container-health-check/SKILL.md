/**
 * 容器健康检查系统
 * Container Health Check System
 * 
 * 特性：
 * - Liveness探针
 * - Readiness探针  
 * - K8s阈值配置
 * - 启动延迟
 * 
 * 信号: container_health_check, docker_healthcheck, kubernetes_liveness
 */

class ContainerHealthCheck {
  constructor(options = {}) {
    this.livenessPath = options.livenessPath || '/health/live';
    this.readinessPath = options.readinessPath || '/health/ready';
    this.livenessThreshold = options.livenessThreshold || 3;
    this.readinessThreshold = options.readinessThreshold || 3;
    this.initialDelaySeconds = options.initialDelaySeconds || 30;
    this.periodSeconds = options.periodSeconds || 10;
    this.timeoutSeconds = options.timeoutSeconds || 5;
    this.successThreshold = options.successThreshold || 1;
    this.failureThreshold = options.failureThreshold || 3;
  }

  /**
   * Liveness检查 - 进程状态
   */
  async checkLiveness() {
    return {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  /**
   * Readiness检查 - 依赖检查
   */
  async checkReadiness() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkExternalServices()
    ]);

    const results = checks.map((result, index) => ({
      service: ['database', 'cache', 'external'][index],
      status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      detail: result.status === 'fulfilled' ? result.value : result.reason?.message
    }));

    const allHealthy = results.every(r => r.status === 'healthy');

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: Date.now(),
      checks: results
    };
  }

  /**
   * 数据库检查
   */
  async checkDatabase() {
    // 模拟检查
    return { connected: true, latency: 10 };
  }

  /**
   * 缓存检查
   */
  async checkCache() {
    return { connected: true };
  }

  /**
   * 外部服务检查
   */
  async checkExternalServices() {
    return { all_healthy: true };
  }

  /**
   * K8s探针配置生成
   */
  getK8sProbeConfig() {
    return {
      livenessProbe: {
        httpGet: {
          path: this.livenessPath,
          port: 3000
        },
        initialDelaySeconds: this.initialDelaySeconds,
        periodSeconds: this.periodSeconds,
        timeoutSeconds: this.timeoutSeconds,
        successThreshold: this.successThreshold,
        failureThreshold: this.failureThreshold
      },
      readinessProbe: {
        httpGet: {
          path: this.readinessPath,
          port: 3000
        },
        initialDelaySeconds: this.initialDelaySeconds,
        periodSeconds: this.periodSeconds,
        timeoutSeconds: this.timeoutSeconds,
        successThreshold: this.successThreshold,
        failureThreshold: this.failureThreshold
      }
    };
  }

  /**
   * Docker健康检查配置
   */
  getDockerHealthCheck() {
    return {
      Healthcheck: {
        Test: ['CMD', 'curl', '-f', `http://localhost:3000${this.livenessPath}`],
        Interval: `${this.periodSeconds}s`,
        Timeout: `${this.timeoutSeconds}s`,
        Retries: this.failureThreshold,
        StartPeriod: `${this.initialDelaySeconds}s`
      }
    };
  }

  /**
   * 启动探针（等待服务完全启动）
   */
  async waitForStartup() {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.initialDelaySeconds * 1000) {
      const readiness = await this.checkReadiness();
      if (readiness.status === 'ready') {
        return { started: true, waitTime: Date.now() - startTime };
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    return { started: false, waitTime: Date.now() - startTime };
  }
}

/**
 * 创建健康检查实例
 */
function createHealthCheck(options) {
  return new ContainerHealthCheck(options);
}

module.exports = {
  ContainerHealthCheck,
  createHealthCheck
};
