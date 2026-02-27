/**
 * Cross-Session Memory Manager
 * 跨会话记忆管理器
 * 基于 EvoMap 胶囊: sha256:def136049c982ed785117dff00bb3238ed71d11cf77c019b3db2a8f65b476f06
 * GDI: 69.15
 * 触发信号: session_amnesia, context_loss, cross_session_gap
 */

const fs = require('fs');
const path = require('path');

class CrossSessionMemory {
  constructor(options = {}) {
    this.workspace = options.workspace || process.cwd();
    this.recentEventsPath = path.join(this.workspace, 'RECENT_EVENTS.md');
    this.dailyMemoryPath = options.dailyMemoryPath || path.join(this.workspace, 'memory');
    this.longTermMemoryPath = path.join(this.workspace, 'MEMORY.md');
    
    // 24小时滚动窗口
    this.recentWindowMs = 24 * 60 * 60 * 1000; // 24小时
  }

  // 加载所有记忆
  async loadAllMemory() {
    const memory = {
      recentEvents: [],
      dailyMemories: [],
      longTermMemory: ''
    };

    // 1. 加载 RECENT_EVENTS.md (24h滚动)
    try {
      if (fs.existsSync(this.recentEventsPath)) {
        const content = fs.readFileSync(this.recentEventsPath, 'utf8');
        const lines = content.split('\n');
        
        // 解析带时间戳的事件
        const cutoffTime = Date.now() - this.recentWindowMs;
        
        for (const line of lines) {
          // 尝试解析时间戳 [YYYY-MM-DD HH:mm:ss] 或 [timestamp]
          const match = line.match(/^\[?(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})\]?\s*(.*)/);
          if (match) {
            const timestamp = new Date(match[1]).getTime();
            if (!isNaN(timestamp) && timestamp > cutoffTime) {
              memory.recentEvents.push({
                timestamp: match[1],
                content: match[2]
              });
            }
          } else if (line.trim()) {
            // 没有时间戳的视为最近事件
            memory.recentEvents.push({
              timestamp: new Date().toISOString(),
              content: line
            });
          }
        }
      }
    } catch (e) {
      console.error('Error loading RECENT_EVENTS.md:', e.message);
    }

    // 2. 加载 daily memory (YYYY-MM-DD.md)
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      for (const date of [today, yesterday]) {
        const dailyPath = path.join(this.dailyMemoryPath, `${date}.md`);
        if (fs.existsSync(dailyPath)) {
          const content = fs.readFileSync(dailyPath, 'utf8');
          memory.dailyMemories.push({
            date,
            content
          });
        }
      }
    } catch (e) {
      console.error('Error loading daily memory:', e.message);
    }

    // 3. 加载长期记忆 MEMORY.md
    try {
      if (fs.existsSync(this.longTermMemoryPath)) {
        memory.longTermMemory = fs.readFileSync(this.longTermMemoryPath, 'utf8');
      }
    } catch (e) {
      console.error('Error loading MEMORY.md:', e.message);
    }

    return memory;
  }

  // 保存到 RECENT_EVENTS.md
  appendRecentEvent(event) {
    try {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const entry = `[${timestamp}] ${event}\n`;
      
      // 读取现有内容
      let existing = '';
      if (fs.existsSync(this.recentEventsPath)) {
        existing = fs.readFileSync(this.recentEventsPath, 'utf8');
      }
      
      // 添加新事件到开头
      fs.writeFileSync(this.recentEventsPath, entry + existing);
      
      return true;
    } catch (e) {
      console.error('Error appending to RECENT_EVENTS:', e.message);
      return false;
    }
  }

  // 清理过期事件 (24小时前的)
  cleanupOldEvents() {
    try {
      if (!fs.existsSync(this.recentEventsPath)) return;
      
      const content = fs.readFileSync(this.recentEventsPath, 'utf8');
      const lines = content.split('\n');
      const cutoffTime = Date.now() - this.recentWindowMs;
      
      const validLines = lines.filter(line => {
        const match = line.match(/^\[?(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})\]?\s*/);
        if (!match) return line.trim() !== '';
        
        const timestamp = new Date(match[1]).getTime();
        return !isNaN(timestamp) && timestamp > cutoffTime;
      });
      
      fs.writeFileSync(this.recentEventsPath, validLines.join('\n'));
    } catch (e) {
      console.error('Error cleaning up old events:', e.message);
    }
  }

  // 生成上下文摘要
  generateContextSummary(memory) {
    const summary = {
      recentEventsCount: memory.recentEvents.length,
      dailyMemoriesCount: memory.dailyMemories.length,
      hasLongTermMemory: memory.longTermMemory.length > 0,
      preview: []
    };

    // 添加最近事件的预览
    memory.recentEvents.slice(0, 5).forEach(e => {
      summary.preview.push(`[${e.timestamp}] ${e.content.substring(0, 100)}`);
    });

    return summary;
  }

  // 初始化会话
  async initSession() {
    console.log('🔄 初始化跨会话记忆...');
    
    // 清理旧事件
    this.cleanupOldEvents();
    
    // 加载所有记忆
    const memory = await this.loadAllMemory();
    
    // 生成摘要
    const summary = this.generateContextSummary(memory);
    
    console.log(`📚 记忆加载完成:`);
    console.log(`   - 最近事件: ${summary.recentEventsCount} 条`);
    console.log(`   - 每日记忆: ${summary.dailyMemoriesCount} 天`);
    console.log(`   - 长期记忆: ${summary.hasLongTermMemory ? '有' : '无'}`);
    
    return memory;
  }

  // 记录重要事件
  recordImportantEvent(event) {
    return this.appendRecentEvent(event);
  }
}

// 导出
module.exports = { CrossSessionMemory };
