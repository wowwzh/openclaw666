/**
 * 数据流水线系统
 * Data Pipeline System
 * 
 * 特性：
 * - 多阶段处理
 * - 并行流水线
 * - 错误处理
 * - 监控告警
 * 
 * 信号: data_pipeline, etl, stream_processing
 */

class DataPipeline {
  constructor(options = {}) {
    this.stages = [];
    this.bufferSize = options.bufferSize || 100;
    this.concurrency = options.concurrency || 3;
    this.errorHandling = options.errorHandling || 'continue'; // continue, stop, retry
    this.metrics = {
      processed: 0,
      failed: 0,
      latency: []
    };
  }

  /**
   * 添加阶段
   */
  stage(name, handler, options = {}) {
    this.stages.push({
      name,
      handler,
      parallel: options.parallel || false,
      bufferSize: options.bufferSize || this.bufferSize
    });
    return this;
  }

  /**
   * 执行流水线
   */
  async run(input) {
    let data = input;
    
    console.log(`[Pipeline] Starting with ${this.stages.length} stages`);
    
    for (const stage of this.stages) {
      const startTime = Date.now();
      
      console.log(`[Pipeline] Stage: ${stage.name}`);
      
      try {
        if (stage.parallel && Array.isArray(data)) {
          // 并行处理
          const chunks = this.chunkArray(data, this.concurrency);
          const results = await Promise.all(
            chunks.map(chunk => stage.handler(chunk))
          );
          data = results.flat();
        } else {
          // 串行处理
          data = await stage.handler(data);
        }
        
        const latency = Date.now() - startTime;
        this.metrics.processed += Array.isArray(data) ? data.length : 1;
        this.metrics.latency.push(latency);
        
      } catch (error) {
        console.log(`[Pipeline] Error in stage ${stage.name}:`, error.message);
        
        if (this.errorHandling === 'stop') {
          throw error;
        } else if (this.errorHandling === 'retry') {
          // 重试
          data = await this.retryStage(stage, data);
        }
        // continue: 跳过错误数据
        this.metrics.failed++;
      }
    }
    
    return data;
  }

  /**
   * 重试阶段
   */
  async retryStage(stage, data, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await stage.handler(data);
      } catch (error) {
        console.log(`[Pipeline] Retry ${i + 1}/${maxRetries} failed`);
      }
    }
    return data;
  }

  /**
   * 分块数组
   */
  chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 获取指标
   */
  getMetrics() {
    const avgLatency = this.metrics.latency.length > 0
      ? this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length
      : 0;
    
    return {
      processed: this.metrics.processed,
      failed: this.metrics.failed,
      avgLatency: avgLatency.toFixed(2) + 'ms',
      successRate: ((this.metrics.processed / (this.metrics.processed + this.metrics.failed)) * 100).toFixed(2) + '%'
    };
  }

  /**
   * 重置指标
   */
  resetMetrics() {
    this.metrics = {
      processed: 0,
      failed: 0,
      latency: []
    };
  }
}

/**
 * 流式流水线
 */
class StreamPipeline {
  constructor(options = {}) {
    this.transformers = [];
    this.onData = options.onData || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * 添加转换器
   */
  transform(name, fn) {
    this.transformers.push({ name, fn });
    return this;
  }

  /**
   * 处理流数据
   */
  async process(data) {
    let result = data;
    
    for (const { name, fn } of this.transformers) {
      try {
        result = await fn(result);
      } catch (error) {
        this.onError({ stage: name, error });
        if (this.errorHandling === 'stop') break;
      }
    }
    
    this.onData(result);
    return result;
  }
}

/**
 * 创建流水线
 */
function createPipeline(options) {
  return new DataPipeline(options);
}

/**
 * 创建流式流水线
 */
function createStreamPipeline(options) {
  return new StreamPipeline(options);
}

module.exports = {
  DataPipeline,
  StreamPipeline,
  createPipeline,
  createStreamPipeline
};
