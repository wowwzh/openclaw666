/**
 * 跨会话记忆增强系统
 * Cross-Session Memory Enhancement
 * 
 * 特性：
 * - 向量存储 (Vector Storage)
 * - 语义搜索 (Semantic Search)
 * - 记忆连续性 (Memory Continuity)
 * - 自动摘要 (Auto-Summary)
 * 
 * 信号: session_lost, context_gap, memory_recall
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CrossSessionMemory {
  constructor(options = {}) {
    this.memoryDir = options.memoryDir || './memory';
    this.vectorStorePath = options.vectorStorePath || './vector-store.json';
    this.maxHistory = options.maxHistory || 100;
    this.summaryThreshold = options.summaryThreshold || 10;
    this.vectors = this.loadVectors();
    this.recentMemories = [];
  }

  /**
   * 加载向量存储
   */
  loadVectors() {
    try {
      if (fs.existsSync(this.vectorStorePath)) {
        return JSON.parse(fs.readFileSync(this.vectorStorePath, 'utf8'));
      }
    } catch (e) {
      console.log('[Memory] No existing vector store');
    }
    return { vectors: [], metadata: {} };
  }

  /**
   * 保存向量存储
   */
  saveVectors() {
    fs.writeFileSync(this.vectorStorePath, JSON.stringify(this.vectors, null, 2));
  }

  /**
   * 创建文本向量（简化版）
   */
  createVector(text) {
    // 简化：使用词频作为向量
    const words = text.toLowerCase().split(/\W+/);
    const vector = {};
    
    for (const word of words) {
      if (word.length > 2) {
        vector[word] = (vector[word] || 0) + 1;
      }
    }
    
    return vector;
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(vec1, vec2) {
    const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const key of keys) {
      const v1 = vec1[key] || 0;
      const v2 = vec2[key] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 存储记忆
   */
  async remember(key, content, metadata = {}) {
    const vector = this.createVector(content);
    const memory = {
      key,
      content,
      vector,
      metadata,
      timestamp: Date.now(),
      id: crypto.randomBytes(8).toString('hex')
    };
    
    this.vectors.vectors.push(memory);
    this.vectors.metadata[key] = {
      lastAccess: Date.now(),
      accessCount: (this.vectors.metadata[key]?.accessCount || 0) + 1
    };
    
    this.recentMemories.push(memory);
    if (this.recentMemories.length > this.maxHistory) {
      this.recentMemories.shift();
    }
    
    this.saveVectors();
    return memory.id;
  }

  /**
   * 语义搜索
   */
  async recall(query, options = {}) {
    const queryVector = this.createVector(query);
    const limit = options.limit || 5;
    const threshold = options.threshold || 0.1;
    
    // 搜索向量存储
    const results = this.vectors.vectors
      .map(memory => ({
        ...memory,
        similarity: this.cosineSimilarity(queryVector, memory.vector)
      }))
      .filter(m => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    // 更新访问统计
    for (const result of results) {
      if (this.vectors.metadata[result.key]) {
        this.vectors.metadata[result.key].lastAccess = Date.now();
        this.vectors.metadata[result.key].accessCount++;
      }
    }
    
    return results;
  }

  /**
   * 精确查找
   */
  async find(key) {
    return this.vectors.vectors.filter(m => m.key === key);
  }

  /**
   * 获取最近的记忆
   */
  getRecentMemories(limit = 10) {
    return this.recentMemories.slice(-limit);
  }

  /**
   * 生成记忆摘要
   */
  async summarize() {
    if (this.recentMemories.length < this.summaryThreshold) {
      return null;
    }
    
    const topics = {};
    for (const memory of this.recentMemories) {
      const words = memory.content.toLowerCase().split(/\W+/);
      for (const word of words.slice(0, 5)) {
        if (word.length > 3) {
          topics[word] = (topics[word] || 0) + 1;
        }
      }
    }
    
    const topTopics = Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
    
    return {
      topics: topTopics,
      memoryCount: this.recentMemories.length,
      timestamp: Date.now()
    };
  }

  /**
   * 检查会话连续性
   */
  checkSessionContinuity(previousSessionId) {
    const recent = this.getRecentMemories(5);
    
    if (recent.length === 0) {
      return { hasContinuity: false, reason: 'no_memory' };
    }
    
    const timeGap = Date.now() - recent[recent.length - 1].timestamp;
    const maxGap = 24 * 60 * 60 * 1000; // 24小时
    
    if (timeGap > maxGap) {
      return { 
        hasContinuity: false, 
        reason: 'time_gap',
        gapHours: timeGap / (1000 * 60 * 60)
      };
    }
    
    return { 
      hasContinuity: true, 
      recentTopics: recent.slice(0, 3).map(m => m.key)
    };
  }

  /**
   * 导出记忆
   */
  export(options = {}) {
    const format = options.format || 'json';
    
    if (format === 'json') {
      return JSON.stringify(this.vectors, null, 2);
    }
    
    // Markdown格式
    let md = '# 记忆导出\n\n';
    for (const memory of this.vectors.vectors.slice(-50)) {
      md += `## ${memory.key}\n`;
      md += `${memory.content}\n\n`;
      md += `*${new Date(memory.timestamp).toLocaleString()}*\n\n`;
    }
    return md;
  }
}

/**
 * 创建记忆实例
 */
function createCrossSessionMemory(options) {
  return new CrossSessionMemory(options);
}

module.exports = {
  CrossSessionMemory,
  createCrossSessionMemory
};
