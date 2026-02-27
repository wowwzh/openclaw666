/**
 * ETL数据转换系统
 * ETL Transform System
 * 
 * 特性：
 * - 数据抽取
 * - 数据转换
 * - 数据加载
 * - 错误处理
 * 
 * 信号: etl_transform, data_pipeline, data_processing
 */

class ETLTransform {
  constructor(options = {}) {
    this.transformers = new Map();
    this.validators = [];
    this.errorHandling = options.errorHandling || 'log'; // log, skip, stop
    this.batchSize = options.batchSize || 1000;
  }

  /**
   * 添加转换器
   */
  transform(name, fn) {
    this.transformers.set(name, fn);
    return this;
  }

  /**
   * 添加验证器
   */
  validate(fn) {
    this.validators.push(fn);
    return this;
  }

  /**
   * 执行ETL
   */
  async run(data, options = {}) {
    const { extract = true, transform = true, load = true } = options;
    
    let result = data;
    
    // Extract
    if (extract) {
      result = await this.extract(result);
    }
    
    // Transform
    if (transform) {
      result = await this.transformData(result);
    }
    
    // Validate
    result = await this.validateData(result);
    
    // Load
    if (load) {
      result = await this.load(result);
    }
    
    return result;
  }

  /**
   * 数据抽取
   */
  async extract(data) {
    if (typeof data === 'function') {
      return await data();
    }
    return data;
  }

  /**
   * 数据转换
   */
  async transformData(data) {
    const items = Array.isArray(data) ? data : [data];
    const transformed = [];

    for (const item of items) {
      try {
        let result = item;
        for (const [name, fn] of this.transformers) {
          result = await fn(result);
        }
        transformed.push(result);
      } catch (error) {
        this.handleError('transform', item, error);
      }
    }

    return transformed;
  }

  /**
   * 数据验证
   */
  async validateData(data) {
    const valid = [];
    
    for (const item of data) {
      let isValid = true;
      let errors = [];
      
      for (const validator of this.validators) {
        try {
          const result = validator(item);
          if (result === false || result?.valid === false) {
            isValid = false;
            errors.push(result?.message || 'Validation failed');
          }
        } catch (error) {
          isValid = false;
          errors.push(error.message);
        }
      }
      
      if (isValid) {
        valid.push(item);
      } else if (this.errorHandling !== 'skip') {
        this.handleError('validate', item, errors.join(', '));
      }
    }
    
    return valid;
  }

  /**
   * 数据加载
   */
  async load(data) {
    // 分批处理
    const batches = [];
    for (let i = 0; i < data.length; i += this.batchSize) {
      batches.push(data.slice(i, i + this.batchSize));
    }
    
    const results = [];
    for (const batch of batches) {
      try {
        const result = await this.loadBatch(batch);
        results.push(...result);
      } catch (error) {
        this.handleError('load', batch, error);
      }
    }
    
    return results;
  }

  /**
   * 批量加载
   */
  async loadBatch(batch) {
    // 模拟加载
    return batch.map(item => ({ ...item, loaded: true }));
  }

  /**
   * 错误处理
   */
  handleError(stage, item, error) {
    switch (this.errorHandling) {
      case 'stop':
        throw new Error(`ETL Error in ${stage}: ${error.message}`);
      case 'skip':
        console.log(`[ETL] Skipped item due to error in ${stage}`);
        break;
      case 'log':
      default:
        console.log(`[ETL] Error in ${stage}:`, error.message || error);
    }
  }

  /**
   * 常用转换器
   */
  static commonTransformers = {
    // 重命名字段
    rename: (oldName, newName) => item => {
      const result = { ...item };
      result[newName] = result[oldName];
      delete result[oldName];
      return result;
    },

    // 删除字段
    remove: (...fields) => item => {
      const result = { ...item };
      fields.forEach(f => delete result[f]);
      return result;
    },

    // 类型转换
    cast: (field, type) => item => {
      const value = item[field];
      let casted;
      switch (type) {
        case 'number':
          casted = Number(value);
          break;
        case 'string':
          casted = String(value);
          break;
        case 'boolean':
          casted = Boolean(value);
          break;
        case 'date':
          casted = new Date(value);
          break;
        default:
          casted = value;
      }
      return { ...item, [field]: casted };
    },

    // 映射值
    map: (field, mapping) => item => ({
      ...item,
      [field]: mapping[item[field]] ?? item[field]
    }),

    // 默认值
    defaultValue: (field, defaultVal) => item => ({
      ...item,
      [field]: item[field] ?? defaultVal
    })
  };
}

/**
 * 创建ETL实例
 */
function createETL(options) {
  return new ETLTransform(options);
}

module.exports = {
  ETLTransform,
  createETL
};
