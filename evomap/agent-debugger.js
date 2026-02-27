/**
 * Agent Self-Debug Framework
 * Agent自检调试框架
 * 功能：错误捕获 → 根因分析 → 自动修复 → 报告生成
 */

class AgentDebugger {
  constructor(options = {}) {
    this.errorRules = new Map();
    this.autoFixStrategies = new Map();
    this.onError = options.onError || null;
    this.onFix = options.onFix || null;
    this.onReport = options.onReport || null;
    
    // 初始化错误规则库
    this.initErrorRules();
    // 初始化自动修复策略
    this.initFixStrategies();
  }

  // 初始化错误规则库
  initErrorRules() {
    const rules = [
      // 文件相关
      { pattern: /ENOENT.*not found/, type: 'file_not_found', severity: 'medium', suggestion: '创建缺失的文件或检查路径' },
      { pattern: /EACCES.*permission denied/, type: 'permission_denied', severity: 'high', suggestion: '检查文件权限' },
      { pattern: /EBUSY.*used by another process/, type: 'file_locked', severity: 'medium', suggestion: '关闭占用进程' },
      
      // 网络相关
      { pattern: /ECONNREFUSED/, type: 'connection_refused', severity: 'medium', suggestion: '检查服务是否运行' },
      { pattern: /ECONNRESET/, type: 'connection_reset', severity: 'low', suggestion: '重试请求' },
      { pattern: /ETIMEDOUT|timeout/i, type: 'timeout', severity: 'low', suggestion: '增加超时时间' },
      { pattern: /429|rate limit/i, type: 'rate_limit', severity: 'medium', suggestion: '添加延迟后重试' },
      
      // 进程相关
      { pattern: /spawn.*ENOENT/, type: 'command_not_found', severity: 'high', suggestion: '安装缺失的命令' },
      { pattern: /child_process.*failed/, type: 'process_failed', severity: 'high', suggestion: '检查子进程错误' },
      
      // 内存相关
      { pattern: /heap out of memory|OOM/i, type: 'memory_error', severity: 'critical', suggestion: '增加Node.js内存限制' },
      { pattern: /FATAL ERROR/, type: 'fatal_error', severity: 'critical', suggestion: '查看详细错误信息' },
      
      // 语法/代码相关
      { pattern: /SyntaxError/, type: 'syntax_error', severity: 'high', suggestion: '检查代码语法' },
      { pattern: /ReferenceError.*is not defined/, type: 'undefined_error', severity: 'high', suggestion: '检查变量定义' },
      { pattern: /TypeError.*cannot read/i, type: 'type_error', severity: 'high', suggestion: '检查对象属性' },
      
      // API相关
      { pattern: /401|unauthorized/i, type: 'auth_error', severity: 'high', suggestion: '检查认证信息' },
      { pattern: /403|forbidden/i, type: 'forbidden', severity: 'high', suggestion: '检查权限设置' },
      { pattern: /404|not found/i, type: 'not_found', severity: 'medium', check: '检查资源是否存在' },
      { pattern: /500|server error/i, type: 'server_error', severity: 'medium', suggestion: '服务端问题，稍后重试' },
      
      // 通用
      { pattern: /Error:/, type: 'unknown', severity: 'medium', suggestion: '需要人工介入' }
    ];
    
    rules.forEach(rule => {
      this.errorRules.set(rule.pattern, rule);
    });
  }

  // 初始化自动修复策略
  initFixStrategies() {
    const strategies = [
      {
        type: 'file_not_found',
        fix: async (error, context) => {
          // 尝试创建缺失的目录
          if (context.filePath) {
            const fs = require('fs');
            const path = require('path');
            const dir = path.dirname(context.filePath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
              return { success: true, action: `创建目录: ${dir}` };
            }
          }
          return { success: false, reason: '无法自动修复' };
        }
      },
      {
        type: 'permission_denied',
        fix: async (error, context) => {
          return { 
            success: false, 
            action: '需要手动执行: chmod +x 或管理员权限',
            suggestion: '在Windows上右键管理员运行'
          };
        }
      },
      {
        type: 'rate_limit',
        fix: async (error, context) => {
          // 返回需要延迟的建议
          return { 
            success: true, 
            action: '添加延迟后重试',
            delay: 5000,
            suggestion: '建议添加5秒延迟'
          };
        }
      },
      {
        type: 'timeout',
        fix: async (error, context) => {
          return { 
            success: true, 
            action: '增加超时时间',
            suggestion: '建议将超时时间增加到30秒'
          };
        }
      },
      {
        type: 'command_not_found',
        fix: async (error, context) => {
          // 提取缺失的命令
          const match = error.message.match(/spawn ([^_]+)/);
          if (match) {
            return {
              success: false,
              action: `命令 ${match[1]} 未找到`,
              suggestion: `需要安装: npm install -g ${match[1]} 或 apt-get install ${match[1]}`
            };
          }
          return { success: false, reason: '无法识别命令' };
        }
      }
    ];
    
    strategies.forEach(strategy => {
      this.autoFixStrategies.set(strategy.type, strategy);
    });
  }

  // 解析错误
  parseError(error) {
    const errorStr = String(error);
    
    for (const [pattern, rule] of this.errorRules) {
      if (pattern.test(errorStr)) {
        return {
          ...rule,
          message: errorStr,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // 未匹配到规则
    return {
      type: 'unknown',
      severity: 'medium',
      message: errorStr,
      suggestion: '需要人工介入',
      timestamp: new Date().toISOString()
    };
  }

  // 尝试自动修复
  async tryFix(errorInfo, context = {}) {
    const strategy = this.autoFixStrategies.get(errorInfo.type);
    
    if (!strategy) {
      return { 
        fixable: false, 
        reason: `没有针对 ${errorInfo.type} 的自动修复策略` 
      };
    }
    
    try {
      const result = await strategy.fix(errorInfo, context);
      
      if (this.onFix) {
        this.onFix(errorInfo, result);
      }
      
      return { fixable: true, ...result };
    } catch (e) {
      return { fixable: false, error: e.message };
    }
  }

  // 生成报告
  generateReport(errorInfo, fixResult) {
    const report = {
      summary: 'Agent错误自检报告',
      timestamp: new Date().toISOString(),
      error: {
        type: errorInfo.type,
        severity: errorInfo.severity,
        message: errorInfo.message,
        suggestion: errorInfo.suggestion
      },
      fix: fixResult,
      recommendation: this.getRecommendation(errorInfo, fixResult)
    };
    
    if (this.onReport) {
      this.onReport(report);
    }
    
    return report;
  }

  // 获取建议
  getRecommendation(errorInfo, fixResult) {
    if (fixResult.fixable && fixResult.success) {
      return `✅ 已自动修复: ${fixResult.action}`;
    } else if (fixResult.fixable && fixResult.delay) {
      return `⏳ 需要延迟: ${fixResult.delay}ms 后重试`;
    } else {
      return `❌ 需要人工介入: ${fixResult.suggestion || fixResult.reason || errorInfo.suggestion}`;
    }
  }

  // 主处理流程
  async handle(error, context = {}) {
    // 1. 解析错误
    const errorInfo = this.parseError(error);
    
    if (this.onError) {
      this.onError(errorInfo);
    }
    
    // 2. 尝试自动修复
    const fixResult = await this.tryFix(errorInfo, context);
    
    // 3. 生成报告
    const report = this.generateReport(errorInfo, fixResult);
    
    return report;
  }

  // 便捷方法：处理工具执行错误
  async handleToolError(toolResult, context = {}) {
    if (toolResult.status === 'error') {
      return await this.handle(toolResult.error, { ...context, tool: toolResult.tool });
    }
    return { status: 'ok', message: '无错误' };
  }
}

// 导出
module.exports = { AgentDebugger };
