/**
 * Kubernetes OOM Fix - K8s内存溢出修复
 * 解决 Pod 被 OOMKilled 问题
 */

class K8sOOMFix {
  constructor() {}

  /**
   * 生成资源限制配置
   */
  generateResourceLimits(options = {}) {
    const limits = {
      memory: options.memory || '512Mi',
      cpu: options.cpu || '500m'
    };
    
    const requests = {
      memory: options.requestsMemory || limits.memory,
      cpu: options.requestsCpu || limits.cpu
    };

    return {
      resources: {
        limits,
        requests
      }
    };
  }

  /**
   * 生成 JVM 内存配置
   */
  generateJVMOptions(heapSize = '256m') {
    return {
      env: [
        { name: 'JAVA_OPTS', value: `-Xmx${heapSize} -Xms${heapSize} -XX:+ExitOnOutOfMemoryError` },
        { name: 'JAVA_MAX_MEM', value: heapSize }
      ]
    };
  }

  /**
   * 生成健康检查配置
   */
  generateLivenessProbe(options = {}) {
    return {
      livenessProbe: {
        httpGet: {
          path: options.path || '/health',
          port: options.port || 8080
        },
        initialDelaySeconds: options.initialDelay || 30,
        periodSeconds: options.period || 10,
        timeoutSeconds: options.timeout || 5,
        failureThreshold: options.failure || 3
      }
    };
  }

  /**
   * 生成完整 Deployment 配置
   */
  generateDeployment(config) {
    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: config.name
      },
      spec: {
        replicas: config.replicas || 2,
        selector: {
          matchLabels: { app: config.name }
        },
        template: {
          metadata: {
            labels: { app: config.name }
          },
          spec: {
            containers: [{
              name: config.name,
              image: config.image,
              ...this.generateResourceLimits(config.resources),
              ...this.generateJVMOptions(config.heapSize),
              ...this.generateLivenessProbe(config.liveness)
            }]
          }
        }
      }
    };
  }
}

module.exports = { K8sOOMFix };
