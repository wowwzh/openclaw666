/**
 * 批处理系统
 * Batch Process System
 * 
 * 特性：
 * - 分批处理大数据
 * - 进度追踪
 * - 错误恢复
 * - 并发控制
 * 
 * 信号: batch_process, large_data, bulk_operation
 */

class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.concurrency = options.concurrency || 3;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.onProgress = options.onProgress || null;
    this.onError = options.onError || null;
  }

  /**
   * 批量处理数据
   */
  async process(items, processorFn) {
    const total = items.length;
    const batches = this.createBatches(items);
    const results = [];
    const errors = [];
    let completed = 0;

    console.log(`[BatchProcess] Total: ${total}, Batches: ${batches.length}`);

    for (const batch of batches) {
      // 并发处理批次
      const batchResults = await this.processBatch(batch, processorFn);
      
      results.push(...batchResults.results);
      errors.push(...batchResults.errors);
      
      completed += batch.length;
      
      // 进度回调
      if (this.onProgress) {
        this.onProgress({
          completed,
          total,
          percent: Math.round((completed / total) * 100),
          batchIndex: batches.indexOf(batch),
          totalBatches: batches.length
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors
    };
  }

  /**
   * 创建批次
   */
  createBatches(items) {
    const batches = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize));
    }
    return batches;
  }

  /**
   * 处理单个批次（带并发控制）
   */
  async processBatch(batch, processorFn) {
    const results = [];
    const errors = [];
    
    // 分组并发
    const groups = this.createGroups(batch, this.concurrency);
    
    for (const group of groups) {
      const groupResults = await Promise.allSettled(
        group.map(item => this.processWithRetry(item, processorFn))
      );
      
      groupResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const error = {
            item: group[index],
            error: result.reason?.message || result.reason
          };
          errors.push(error);
          
          if (this.onError) {
            this.onError(error);
          }
        }
      });
    }

    return { results, errors };
  }

  /**
   * 带重试的处理
   */
  async processWithRetry(item, processorFn) {
    let lastError;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        return await processorFn(item);
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * 创建并发组
   */
  createGroups(items, size) {
    const groups = [];
    for (let i = 0; i < items.length; i += size) {
      groups.push(items.slice(i, i + size));
    }
    return groups;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 流式批处理器（适合超大文件）
 */
class StreamBatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 1000;
    this.processFn = options.processFn;
  }

  /**
   * 流式处理
   */
  async *streamProcess(items) {
    let batch = [];
    
    for await (const item of this.iterator(items)) {
      batch.push(item);
      
      if (batch.length >= this.batchSize) {
        yield await this.processBatch(batch);
        batch = [];
      }
    }
    
    // 处理剩余
    if (batch.length > 0) {
      yield await this.processBatch(batch);
    }
  }

  async *iterator(items) {
    for (const item of items) {
      yield item;
    }
  }

  async processBatch(batch) {
    if (this.processFn) {
      return await this.processFn(batch);
    }
    return batch;
  }
}

/**
 * 创建批处理器
 */
function createBatchProcessor(options) {
  return new BatchProcessor(options);
}

/**
 * 创建流式处理器
 */
function createStreamProcessor(options) {
  return new StreamBatchProcessor(options);
}

module.exports = {
  BatchProcessor,
  StreamBatchProcessor,
  createBatchProcessor,
  createStreamProcessor
};
