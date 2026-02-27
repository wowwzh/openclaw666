/**
 * Permission Auditor - 工具使用模式审查
 * 审查 OpenClaw 工具使用模式，检测权限异常
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加风险评分
 * - 添加导出便捷函数
 */

const fs = require('fs');
const path = require('path');

/**
 * 敏感工具列表
 * @type {string[]}
 */
const SENSITIVE_TOOLS = [
  'exec',
  'gateway',
  'process',
  'subagents',
  'sessions_spawn'
];

/**
 * 高风险操作列表
 * @type {string[]}
 */
const HIGH_RISK_OPERATIONS = [
  'rm -rf',
  'del /s',
  'format',
  'shutdown',
  'restart gateway'
];

/**
 * 审计日志
 * @class
 */
class PermissionAuditor {
  /**
   * @param {Object} options - 配置选项
   * @param {string} options.logDir - 日志目录
   * @param {boolean} options.autoSave - 自动保存
   * @param {number} options.maxResults - 最大结果数
   */
  constructor(options = {}) {
    this.logDir = options.logDir || 'D:/OpenClaw/workspace/memory';
    this.autoSave = options.autoSave || false;
    this.maxResults = options.maxResults || 1000;
    this.toolUsage = {};
    this.riskEvents = [];
  }

  /**
   * 记录工具使用
   */
  logToolUsage(toolName, args, result) {
    if (!this.toolUsage[toolName]) {
      this.toolUsage[toolName] = { count: 0, lastUsed: null, results: [] };
    }
    
    this.toolUsage[toolName].count++;
    this.toolUsage[toolName].lastUsed = new Date().toISOString();
    this.toolUsage[toolName].results.push({
      timestamp: new Date().toISOString(),
      success: result?.success || false,
      error: result?.error
    });

    // 检查高风险操作
    this.checkRiskLevel(toolName, args, result);
  }

  /**
   * 检查风险级别
   */
  checkRiskLevel(toolName, args, result) {
    const argsStr = JSON.stringify(args).toLowerCase();
    
    // 敏感工具
    if (SENSITIVE_TOOLS.includes(toolName)) {
      this.riskEvents.push({
        type: 'sensitive_tool',
        tool: toolName,
        timestamp: new Date().toISOString(),
        level: 'medium',
        message: `敏感工具 ${toolName} 被调用`
      });
    }

    // 高风险操作
    for (const op of HIGH_RISK_OPERATIONS) {
      if (argsStr.includes(op.toLowerCase())) {
        this.riskEvents.push({
          type: 'high_risk_operation',
          tool: toolName,
          operation: op,
          timestamp: new Date().toISOString(),
          level: 'high',
          message: `检测到高风险操作: ${op}`
        });
      }
    }
  }

  /**
   * 获取统计报告
   */
  getReport() {
    return {
      generatedAt: new Date().toISOString(),
      toolUsage: this.toolUsage,
      riskEvents: this.riskEvents,
      summary: {
        totalToolsUsed: Object.keys(this.toolUsage).length,
        sensitiveToolCalls: this.riskEvents.filter(e => e.type === 'sensitive_tool').length,
        highRiskOperations: this.riskEvents.filter(e => e.type === 'high_risk_operation').length
      }
    };
  }

  /**
   * 保存报告
   */
  saveReport() {
    const report = this.getReport();
    const file = path.join(this.logDir, `permission-audit-${Date.now()}.json`);
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
    return file;
  }

  /**
   * 重置审计数据
   */
  reset() {
    this.toolUsage = {};
    this.riskEvents = [];
  }
}

module.exports = {
  PermissionAuditor,
  SENSITIVE_TOOLS,
  HIGH_RISK_OPERATIONS,
  // v1.1 便捷函数
  createAuditor: (options) => new PermissionAuditor(options),
  getRiskLevel: (toolName, args = {}) => {
    if (SENSITIVE_TOOLS.includes(toolName)) return 'medium';
    const argsStr = JSON.stringify(args).toLowerCase();
    for (const op of HIGH_RISK_OPERATIONS) {
      if (argsStr.includes(op.toLowerCase())) return 'high';
    }
    return 'low';
  }
};
