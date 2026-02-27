/**
 * AI Agent 自省调试系统
 * AI Agent Introspection Debugging
 * 
 * 特性：
 * - 运行时状态监控
 * - 错误根因分析
 * - 自动修复建议
 * - 调试报告生成
 * 
 * 信号: introspection, debugging, runtime_error, agent_stuck
 */

class AgentIntrospector {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 100;
    this.inspections = [];
    this.errorPatterns = this.loadErrorPatterns();
  }

  /**
   * 加载错误模式
   */
  loadErrorPatterns() {
    return {
      // 常见错误模式
      timeout: {
        symptoms: ['timeout', 'TIMEOUT', 'ETIMEDOUT'],
        rootCauses: [
          '网络延迟过高',
          '服务响应慢',
          '资源不足',
          '死循环'
        ],
        suggestions: [
          '增加超时时间',
          '检查网络连接',
          '优化查询性能',
          '添加重试机制'
        ]
      },
      memory_leak: {
        symptoms: ['memory', 'heap', 'OOM'],
        rootCauses: [
          '未释放的大对象',
          '缓存无限增长',
          '事件监听器未清理'
        ],
        suggestions: [
          '使用WeakMap/WeakSet',
          '添加内存限制',
          '定期清理缓存'
        ]
      },
      infinite_loop: {
        symptoms: ['loop', 'infinite', 'stack overflow'],
        rootCauses: [
          '循环终止条件错误',
          '递归没有基 case',
          '异步回调未返回'
        ],
        suggestions: [
          '添加循环上限',
          '检查递归终止条件',
          '使用 async/await'
        ]
      },
      auth_error: {
        symptoms: ['unauthorized', '401', '403', 'token'],
        rootCauses: [
          'Token 过期',
          '权限不足',
          '签名错误'
        ],
        suggestions: [
          '刷新 Token',
          '检查权限配置',
          '验证签名算法'
        ]
      },
      rate_limit: {
        symptoms: ['429', 'rate limit', 'too many'],
        rootCauses: [
          '请求频率过高',
          '并发超限',
          '配额用尽'
        ],
        suggestions: [
          '添加请求间隔',
          '使用限流器',
          '等待配额重置'
        ]
      }
    };
  }

  /**
   * 检查代理状态
   */
  async inspect(agentState) {
    const inspection = {
      id: this.generateId(),
      timestamp: Date.now(),
      state: agentState,
      issues: [],
      recommendations: []
    };

    // 检查基本状态
    if (!agentState) {
      inspection.issues.push({
        type: 'NO_STATE',
        message: '代理状态为空'
      });
      return inspection;
    }

    // 检查内存使用
    if (agentState.memoryUsage) {
      const mem = agentState.memoryUsage;
      if (mem.heapUsed > mem.heapTotal * 0.9) {
        inspection.issues.push({
          type: 'HIGH_MEMORY',
          message: `内存使用率: ${(mem.heapUsed / mem.heapTotal * 100).toFixed(1)}%`,
          severity: 'high'
        });
        inspection.recommendations.push('建议增加内存或优化内存使用');
      }
    }

    // 检查任务队列
    if (agentState.taskQueue) {
      const queue = agentState.taskQueue;
      if (queue.pending > 100) {
        inspection.issues.push({
          type: 'QUEUE_OVERFLOW',
          message: `待处理任务: ${queue.pending}`,
          severity: 'medium'
        });
        inspection.recommendations.push('考虑增加 worker 或优化任务处理');
      }
    }

    // 检查错误日志
    if (agentState.errors && agentState.errors.length > 0) {
      const latestError = agentState.errors[agentState.errors.length - 1];
      const analysis = this.analyzeError(latestError);
      inspection.issues.push({
        type: 'LATEST_ERROR',
        message: latestError,
        analysis
      });
    }

    // 检查响应时间
    if (agentState.avgResponseTime && agentState.avgResponseTime > 5000) {
      inspection.issues.push({
        type: 'SLOW_RESPONSE',
        message: `平均响应时间: ${agentState.avgResponseTime}ms`,
        severity: 'medium'
      });
      inspection.recommendations.push('建议检查性能瓶颈');
    }

    // 检查卡顿
    if (agentState.lastActivity) {
      const gap = Date.now() - agentState.lastActivity;
      if (gap > 60000) { // 超过1分钟无活动
        inspection.issues.push({
          type: 'AGENT_STUCK',
          message: `代理已卡顿 ${(gap / 1000).toFixed(0)} 秒`,
          severity: 'critical'
        });
        inspection.recommendations.push('建议重启代理或检查死锁');
      }
    }

    this.inspections.push(inspection);
    if (this.inspections.length > this.maxHistory) {
      this.inspections.shift();
    }

    return inspection;
  }

  /**
   * 分析错误
   */
  analyzeError(error) {
    const errorStr = String(error).toLowerCase();
    
    for (const [patternName, pattern] of Object.entries(this.errorPatterns)) {
      if (pattern.symptoms.some(s => errorStr.includes(s.toLowerCase()))) {
        return {
          pattern: patternName,
          rootCauses: pattern.rootCauses,
          suggestions: pattern.suggestions
        };
      }
    }

    // 未知错误
    return {
      pattern: 'unknown',
      rootCauses: ['未知错误'],
      suggestions: ['查看详细日志', '联系支持团队']
    };
  }

  /**
   * 根因分析
   */
  rootCauseAnalysis(issue) {
    const analysis = {
      issue,
      possibleCauses: [],
      evidence: [],
      recommendations: []
    };

    // 收集历史数据
    const relatedInspections = this.inspections
      .filter(i => i.issues.some(iss => iss.type === issue.type))
      .slice(-10);

    if (relatedInspections.length > 0) {
      analysis.evidence.push({
        type: 'history',
        message: `过去检测到 ${relatedInspections.length} 次类似问题`
      });
    }

    // 模式匹配
    const pattern = this.errorPatterns[issue.type];
    if (pattern) {
      analysis.possibleCauses = pattern.rootCauses;
      analysis.recommendations = pattern.suggestions;
    }

    return analysis;
  }

  /**
   * 生成调试报告
   */
  generateReport(inspection) {
    const report = {
      title: 'AI Agent 调试报告',
      timestamp: new Date(inspection.timestamp).toLocaleString(),
      summary: {
        totalIssues: inspection.issues.length,
        critical: inspection.issues.filter(i => i.severity === 'critical').length,
        high: inspection.issues.filter(i => i.severity === 'high').length,
        medium: inspection.issues.filter(i => i.severity === 'medium').length
      },
      issues: [],
      recommendations: []
    };

    // 添加问题详情
    for (const issue of inspection.issues) {
      const issueReport = {
        type: issue.type,
        message: issue.message,
        severity: issue.severity || 'low',
        analysis: issue.analysis
      };
      
      if (issue.analysis) {
        issueReport.rootCauses = issue.analysis.rootCauses;
        issueReport.suggestions = issue.analysis.suggestions;
      }
      
      report.issues.push(issueReport);
    }

    // 添加建议
    report.recommendations = inspection.recommendations;

    return report;
  }

  /**
   * 自动修复
   */
  async autoFix(issue) {
    const fixes = {
      AGENT_STUCK: async (agent) => {
        // 重置状态
        agent.lastActivity = Date.now();
        agent.currentTask = null;
        return { action: 'reset', message: '已重置代理状态' };
      },
      HIGH_MEMORY: async (agent) => {
        // 清理缓存
        if (agent.cache) {
          agent.cache.clear();
        }
        return { action: 'clear_cache', message: '已清理缓存' };
      },
      QUEUE_OVERFLOW: async (agent) => {
        // 清理过期的任务
        agent.taskQueue = agent.taskQueue.slice(-50);
        return { action: 'trim_queue', message: '已裁剪任务队列' };
      }
    };

    const fix = fixes[issue.type];
    if (fix) {
      return fix(issue);
    }

    return { action: 'none', message: '无自动修复方案' };
  }

  /**
   * 获取历史检查
   */
  getHistory(limit = 10) {
    return this.inspections.slice(-limit);
  }

  generateId() {
    return `inspect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 创建自省调试器
 */
function createIntrospector(options) {
  return new AgentIntrospector(options);
}

module.exports = {
  AgentIntrospector,
  createIntrospector
};
