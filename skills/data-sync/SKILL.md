/**
 * 数据同步系统
 * Data Sync System
 * 
 * 特性：
 * - 增量同步
 * - 冲突解决
 * - 断点续传
 * - 双向同步
 * 
 * 信号: data_sync, sync_conflict, incremental_sync
 */

class DataSync {
  constructor(options = {}) {
    this.source = options.source;
    this.target = options.target;
    this.syncDirection = options.syncDirection || 'one-way'; // one-way, bi-directional
    this.conflictStrategy = options.conflictStrategy || 'newer'; // newer, source, target, manual
    this.checkpointKey = options.checkpointKey || 'data_sync_checkpoint';
    this.lastSync = this.loadCheckpoint();
  }

  /**
   * 增量同步
   */
  async sync() {
    const changes = await this.detectChanges();
    
    console.log(`[DataSync] Detected ${changes.length} changes`);
    
    const results = {
      added: [],
      updated: [],
      deleted: [],
      conflicts: [],
      skipped: []
    };

    for (const change of changes) {
      try {
        const result = await this.applyChange(change);
        if (result.status === 'success') {
          if (change.type === 'added') results.added.push(change);
          else if (change.type === 'updated') results.updated.push(change);
          else if (change.type === 'deleted') results.deleted.push(change);
        } else if (result.status === 'conflict') {
          results.conflicts.push({ change, resolution: result.resolution });
        }
      } catch (error) {
        console.log(`[DataSync] Error:`, error.message);
        results.skipped.push(change);
      }
    }

    // 保存检查点
    this.saveCheckpoint();

    return results;
  }

  /**
   * 检测变化
   */
  async detectChanges() {
    const sourceData = await this.fetchData(this.source);
    const targetData = await this.fetchData(this.target);
    
    const changes = [];
    const sourceMap = new Map(sourceData.map(item => [this.getId(item), item]));
    const targetMap = new Map(targetData.map(item => [this.getId(item), item]));

    // 检测新增和更新
    for (const [id, sourceItem] of sourceMap) {
      const targetItem = targetMap.get(id);
      
      if (!targetItem) {
        changes.push({ type: 'added', id, data: sourceItem });
      } else if (this.isChanged(sourceItem, targetItem)) {
        if (this.shouldUpdate(sourceItem, targetItem)) {
          changes.push({ type: 'updated', id, data: sourceItem, oldData: targetItem });
        }
      }
    }

    // 检测删除（目标有但源没有）
    if (this.syncDirection === 'bi-directional') {
      for (const [id, targetMap) {
       Item] of target if (!sourceMap.has(id)) {
          changes.push({ type: 'deleted', id, data: targetItem });
        }
      }
    }

    return changes;
  }

  /**
   * 应用变化
   */
  async applyChange(change) {
    switch (change.type) {
      case 'added':
        return await this.target.create(change.data);
      
      case 'updated':
        // 检查冲突
        const targetItem = await this.target.get(change.id);
        if (targetItem && this.isChanged(change.data, targetItem)) {
          const resolution = this.resolveConflict(change.data, targetItem);
          if (resolution === 'skip') {
            return { status: 'conflict', resolution: 'skipped' };
          }
          return await this.target.update(change.id, resolution);
        }
        return await this.target.update(change.id, change.data);
      
      case 'deleted':
        return await this.target.delete(change.id);
      
      default:
        return { status: 'unknown' };
    }
  }

  /**
   * 解决冲突
   */
  resolveConflict(sourceData, targetData) {
    switch (this.conflictStrategy) {
      case 'newer':
        return sourceData.updatedAt > targetData.updatedAt ? sourceData : targetData;
      case 'source':
        return sourceData;
      case 'target':
        return targetData;
      case 'manual':
        return null; // 需要手动处理
      default:
        return sourceData;
    }
  }

  /**
   * 判断是否有变化
   */
  isChanged(source, target) {
    return JSON.stringify(source) !== JSON.stringify(target);
  }

  /**
   * 判断是否应该更新
   */
  shouldUpdate(source, target) {
    return source.updatedAt > target.updatedAt;
  }

  /**
   * 获取ID
   */
  getId(item) {
    return item.id || item._id || item.key;
  }

  /**
   * 获取数据
   */
  async fetchData(source) {
    if (typeof source === 'function') {
      return await source();
    }
    return source;
  }

  /**
   * 加载检查点
   */
  loadCheckpoint() {
    try {
      const saved = localStorage?.getItem(this.checkpointKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /**
   * 保存检查点
   */
  saveCheckpoint() {
    const checkpoint = {
      timestamp: Date.now(),
      source: this.source?.name,
      target: this.target?.name
    };
    
    try {
      localStorage?.setItem(this.checkpointKey, JSON.stringify(checkpoint));
    } catch {}
    
    this.lastSync = checkpoint;
  }

  /**
   * 双向同步
   */
  async biDirectionalSync() {
    // 源到目标
    const toTarget = await this.sync();
    
    // 交换源和目标
    const tempSource = this.source;
    this.source = this.target;
    this.target = tempSource;
    
    // 目标到源
    const toSource = await this.sync();
    
    // 恢复
    this.source = this.target;
    this.target = tempSource;
    
    return {
      toTarget,
      toSource
    };
  }
}

/**
 * 创建数据同步实例
 */
function createDataSync(options) {
  return new DataSync(options);
}

module.exports = {
  DataSync,
  createDataSync
};
