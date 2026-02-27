/**
 * Session日志分析器
 * Session Log Analyzer
 * 
 * 特性：
 * - 错误频率分析
 * - 模式识别
 * - 健康趋势
 * - 异常检测
 * 
 * 信号: recurring_error, log_pattern, health_trend, session_diagnosis
 */

class LogAnalyzer {
  constructor(options = {}) {
    this.errorPatterns = options.errorPatterns || [];
    this.windowSize = options.windowSize || 1000; // 分析窗口
    this.threshold = options.threshold || 5; // 错误阈值
    this.logs = [];
    this.errorCounts = new Map();
    this.healthHistory = [];
  }

  /**
   * 添加日志
   */
  addLog(log) {
    this.logs.push({
      ...log,
      timestamp: log.timestamp || Date.now()
    });

    // 只保留窗口大小的日志
    if (this.logs.length > this.windowSize) {
      this.logs.shift();
    }

    // 统计错误
    if (log.level === 'error') {
      const key = this.extractErrorKey(log.message);
      const count = (this.errorCounts.get(key) || 0) + 1;
      this.errorCounts.set(key, count);
    }

    return this;
  }

  /**
   * 提取错误key
   */
  extractErrorKey(message) {
    // 简化：提取错误类型
    const patterns = [
      /timeout/i,
      /connection/i,
      /auth/i,
      /permission/i,
      /network/i,
      /memory/i,
      /undefined/i,
      /null/i
    ];

    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return message.match(pattern)[0].toLowerCase();
      }
    }

    // 返回消息的前50个字符作为key
    return message.substring(0, 50);
  }

  /**
   * 分析错误频率
   */
  analyzeErrorFrequency() {
    const results = [];
    
    for (const [error, count] of this.errorCounts) {
      results.push({ error, count });
    }

    return results
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 识别重复错误
   */
  findRecurringErrors() {
    const recurring = [];
    
    for (const [error, count] of this.errorCounts) {
      if (count >= this.threshold) {
        recurring.push({
          error,
          count,
          severity: count > 20 ? 'critical' : count > 10 ? 'high' : 'medium'
        });
      }
    }

    return recurring;
  }

  /**
   * 分析健康趋势
   */
  analyzeHealthTrend() {
    // 按时间窗口分组
    const windowMs = 60000; // 1分钟窗口
    const windows = new Map();

    for (const log of this.logs) {
      const windowKey = Math.floor(log.timestamp / windowMs);
      if (!windows.has(windowKey)) {
        windows.set(windowKey, { total: 0, errors: 0, warnings: 0 });
      }
      const window = windows.get(windowKey);
      window.total++;
      if (log.level === 'error') window.errors++;
      if (log.level === 'warning') window.warnings++;
    }

    // 计算健康分数
    const healthScores = [];
    for (const [time, data] of windows) {
      const errorRate = data.total > 0 ? (data.errors / data.total) * 100 : 0;
      healthScores.push({
        timestamp: time * windowMs,
        health: Math.max(0, 100 - errorRate * 10),
        errorRate,
        total: data.total
      });
    }

    return healthScores.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * 诊断会话问题
   */
  diagnose() {
    const recurring = this.findRecurringErrors();
    const trend = this.analyzeHealthTrend();
    const recentErrors = this.logs
      .filter(l => l.level === 'error')
      .slice(-10);

    // 判断状态
    let status = 'healthy';
    if (recurring.length > 0) {
      const criticalCount = recurring.filter(r => r.severity === 'critical').length;
      if (criticalCount > 0) status = 'critical';
      else if (recurring.length > 3) status = 'degraded';
      else status = 'warning';
    }

    return {
      status,
      recurringErrors: recurring,
      recentErrors,
      trend: trend.slice(-10),
      errorFrequency: this.analyzeErrorFrequency(),
      recommendations: this.generateRecommendations(recurring, trend)
    };
  }

  /**
   * 生成建议
   */
  generateRecommendations(recurring, trend) {
    const recommendations = [];

    // 基于重复错误
    for (const error of recurring) {
      if (error.error.includes('timeout')) {
        recommendations.push({
          type: 'timeout',
          message: '检测到超时错误，建议增加超时时间或检查网络'
        });
      } else if (error.error.includes('connection')) {
        recommendations.push({
          type: 'connection',
          message: '检测到连接错误，建议检查服务可用性'
        });
      } else if (error.error.includes('auth')) {
        recommendations.push({
          type: 'auth',
          message: '检测到认证错误，建议刷新token'
        });
      }
    }

    // 基于趋势
    if (trend.length > 1) {
      const recent = trend[trend.length - 1];
      const old = trend[0];
      if (recent.health < old.health - 20) {
        recommendations.push({
          type: 'degradation',
          message: '健康分数显著下降，需要关注'
        });
      }
    }

    return recommendations;
  }

  /**
   * 导出报告
   */
  generateReport() {
    const diagnosis = this.diagnosis();
    
    return {
      timestamp: Date.now(),
      summary: {
        totalLogs: this.logs.length,
        totalErrors: this.logs.filter(l => l.level === 'error').length,
        uniqueErrors: this.errorCounts.size
      },
      diagnosis,
      healthScore: diagnosis.status === 'healthy' ? 100 : 
                   diagnosis.status === 'warning' ? 70 : 
                   diagnosis.status === 'degraded' ? 50 : 30
    };
  }

  /**
   * 清除统计
   */
  clear() {
    this.logs = [];
    this.errorCounts.clear();
    this.healthHistory = [];
  }
}

/**
 * 创建日志分析器
 */
function createLogAnalyzer(options) {
  return new LogAnalyzer(options);
}

module.exports = {
  LogAnalyzer,
  createLogAnalyzer
};
