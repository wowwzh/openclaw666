/**
 * 工具自动发现系统
 * Tool Auto-Discovery System
 * 
 * 特性：
 * - 自动发现可用工具
 * - 动态注册
 * - 元学习
 * - 强化学习反馈
 * 
 * 信号: tool_discovery, reinforcement_learning, meta_learning
 */

class ToolDiscovery {
  constructor(options = {}) {
    this.tools = new Map();
    this.discoverPaths = options.discoverPaths || ['./tools', './plugins'];
    this.autoRegister = options.autoRegister || true;
    this.learningRate = options.learningRate || 0.1;
    this.toolScores = new Map();
  }

  /**
   * 发现工具
   */
  async discover() {
    const discovered = [];
    
    for (const path of this.discoverPaths) {
      try {
        const tools = await this.scanDirectory(path);
        discovered.push(...tools);
      } catch (error) {
        console.log(`[ToolDiscovery] Failed to scan ${path}:`, error.message);
      }
    }
    
    console.log(`[ToolDiscovery] Discovered ${discovered.length} tools`);
    return discovered;
  }

  /**
   * 扫描目录
   */
  async scanDirectory(dirPath) {
    const tools = [];
    // 简化：模拟扫描
    const toolNames = ['http-client', 'file-reader', 'json-parser', 'logger'];
    
    for (const name of toolNames) {
      tools.push({
        name,
        path: `${dirPath}/${name}`,
        capabilities: this.inferCapabilities(name),
        score: this.toolScores.get(name) || 0.5
      });
    }
    
    return tools;
  }

  /**
   * 推断工具能力
   */
  inferCapabilities(toolName) {
    const capabilityMap = {
      'http-client': ['fetch', 'request', 'api'],
      'file-reader': ['read', 'file', 'io'],
      'json-parser': ['parse', 'json', 'serialize'],
      'logger': ['log', 'debug', 'info']
    };
    
    return capabilityMap[toolName] || [];
  }

  /**
   * 注册工具
   */
  register(tool) {
    this.tools.set(tool.name, tool);
    console.log(`[ToolDiscovery] Registered: ${tool.name}`);
  }

  /**
   * 查找工具
   */
  find(capability) {
    const matches = [];
    
    for (const [name, tool] of this.tools) {
      if (tool.capabilities?.includes(capability)) {
        matches.push({
          ...tool,
          score: this.toolScores.get(name) || 0.5
        });
      }
    }
    
    // 按分数排序
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * 使用工具后更新分数
   */
  async updateScore(toolName, success, feedback = 0) {
    const currentScore = this.toolScores.get(toolName) || 0.5;
    
    // 强化学习更新
    let reward = success ? 1 : -1;
    reward += feedback;
    
    const newScore = currentScore + this.learningRate * reward;
    this.toolScores.set(toolName, Math.max(0, Math.min(1, newScore)));
    
    return this.toolScores.get(toolName);
  }

  /**
   * 获取工具使用建议
   */
  suggest(task) {
    const keywords = task.toLowerCase().split(/\s+/);
    const toolScores = {};
    
    for (const [name, tool] of this.tools) {
      let score = 0;
      for (const keyword of keywords) {
        if (tool.capabilities?.some(c => c.includes(keyword))) {
          score += 1;
        }
      }
      toolScores[name] = score;
    }
    
    return Object.entries(toolScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => this.tools.get(name));
  }

  /**
   * 获取所有工具
   */
  getAllTools() {
    return Array.from(this.tools.values());
  }
}

/**
 * 创建工具发现实例
 */
function createToolDiscovery(options) {
  return new ToolDiscovery(options);
}

module.exports = {
  ToolDiscovery,
  createToolDiscovery
};
