/**
 * Multi-Agent Swarm Task Framework
 * 多Agent协作框架
 * 功能：自动分解复杂任务 → 并行执行 → 结果聚合 → 贡献计算
 */

class SwarmTask {
  constructor(options = {
    maxAgents: 5,
    timeout: 120000, // 2分钟超时
    onProgress: null
  }) {
    this.maxAgents = options.maxAgents || 5;
    this.timeout = options.timeout || 120000;
    this.onProgress = options.onProgress || null;
  }

  // 智能任务分解
  decomposeTask(task) {
    const { description, context } = task;
    
    // 基于关键词和复杂度自动分类
    const subtasks = [];
    
    // 检测是否需要研究类任务
    if (/搜索|调研|研究|查找|了解|学习/i.test(description)) {
      subtasks.push({
        type: 'research',
        description: `调研: ${description}`,
        priority: 1,
        dependencies: []
      });
    }
    
    // 检测是否需要开发类任务
    if (/开发|写|创建|实现|编写|构建/i.test(description)) {
      subtasks.push({
        type: 'development',
        description: `开发: ${description}`,
        priority: 2,
        dependencies: []
      });
    }
    
    // 检测是否需要分析类任务
    if (/分析|统计|计算|评估|检测/i.test(description)) {
      subtasks.push({
        type: 'analysis',
        description: `分析: ${description}`,
        priority: 1,
        dependencies: []
      });
    }
    
    // 检测是否需要测试类任务
    if (/测试|验证|检查|排查/i.test(description)) {
      subtasks.push({
        type: 'testing',
        description: `测试: ${description}`,
        priority: 3,
        dependencies: []
      });
    }
    
    // 默认添加一个通用任务
    if (subtasks.length === 0) {
      subtasks.push({
        type: 'generic',
        description: description,
        priority: 1,
        dependencies: []
      });
    }
    
    // 限制最大任务数
    return subtasks.slice(0, this.maxAgents);
  }

  // 估算贡献权重
  calculateContribution(subtasks, results) {
    const weights = {
      research: 0.25,
      development: 0.35,
      analysis: 0.20,
      testing: 0.15,
      generic: 0.15
    };
    
    const contributions = [];
    let totalScore = 0;
    
    subtasks.forEach((task, index) => {
      const result = results[index];
      const baseWeight = weights[task.type] || 0.15;
      
      // 根据执行状态调整分数
      let score = baseWeight;
      if (result?.success) score *= 1.0;
      else if (result?.partial) score *= 0.5;
      else score *= 0.1;
      
      contributions.push({
        type: task.type,
        weight: baseWeight,
        score: score,
        result: result
      });
      
      totalScore += score;
    });
    
    // 归一化为百分比
    return contributions.map(c => ({
      ...c,
      percentage: totalScore > 0 ? (c.score / totalScore * 100).toFixed(1) + '%' : '0%'
    }));
  }

  // 聚合结果
  aggregateResults(subtasks, results) {
    const aggregated = {
      summary: '',
      details: [],
      totalTasks: subtasks.length,
      successCount: 0,
      failedCount: 0
    };
    
    subtasks.forEach((task, index) => {
      const result = results[index];
      if (result?.success) aggregated.successCount++;
      if (result?.failed) aggregated.failedCount++;
      
      aggregated.details.push({
        type: task.type,
        description: task.description,
        status: result?.success ? 'success' : (result?.partial ? 'partial' : 'failed'),
        output: result?.output || result?.error || 'No output'
      });
    });
    
    // 生成摘要
    aggregated.summary = `完成 ${aggregated.successCount}/${aggregated.totalTasks} 个子任务`;
    
    return aggregated;
  }

  // 通知进度
  notifyProgress(phase, data) {
    if (this.onProgress) {
      this.onProgress({ phase, ...data });
    }
  }

  // 主执行流程
  async execute(mainTask, agentExecutor) {
    this.notifyProgress('decompose', { task: mainTask });
    
    // 1. 分解任务
    const subtasks = this.decomposeTask(mainTask);
    this.notifyProgress('subtasks', { subtasks });
    
    // 2. 并行执行子任务
    this.notifyProgress('executing', { count: subtasks.length });
    
    const results = await Promise.allSettled(
      subtasks.map(async (subtask) => {
        // 超时控制
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Task timeout')), this.timeout)
        );
        
        const execPromise = agentExecutor(subtask);
        
        try {
          return await Promise.race([execPromise, timeoutPromise]);
        } catch (error) {
          return { success: false, error: error.message };
        }
      })
    );
    
    // 提取结果
    const taskResults = results.map(r => r.status === 'fulfilled' ? r.value : { failed: true, error: r.reason });
    
    // 3. 聚合结果
    this.notifyProgress('aggregating', { subtasks });
    const aggregated = this.aggregateResults(subtasks, taskResults);
    
    // 4. 计算贡献
    this.notifyProgress('calculating', { subtasks });
    const contributions = this.calculateContribution(subtasks, taskResults);
    
    return {
      success: aggregated.successCount > 0,
      subtasks,
      aggregated,
      contributions,
      // 便捷访问
      summary: aggregated.summary,
      details: aggregated.details
    };
  }
}

// 导出
module.exports = { SwarmTask };
