/**
 * CSV 流处理模块
 * 解决大数据导入卡顿问题
 * 
 * 原理：使用流式处理 + 背压控制
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加统计信息
 * - 添加验证函数
 * - 改进错误处理
 */

const fs = require('fs');
const readline = require('readline');

/**
 * @typedef {Object} CSVOptions
 * @property {string} delimiter - 分隔符
 * @property {boolean} headers - 是否有表头
 * @property {number} batchSize - 批次大小
 * @property {Function} onBatch - 批次回调
 */

/**
 * 创建 CSV 读取流
 * @param {string} filePath - 文件路径
 * @param {CSVOptions} options - 配置选项
 * @returns {Promise<Object[]>}
 */
function createCSVStream(filePath, options = {}) {
  const {
    delimiter = ',',
    headers = true,
    batchSize = 100
  } = options;

  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream });

  let headerRow = null;
  let batch = [];
  let rowIndex = 0;

  return new Promise((resolve, reject) => {
    const results = [];
    const onBatch = options.onBatch || (() => {});

    rl.on('line', async (line) => {
      if (!line.trim()) return;

      // 解析行
      const values = parseCSVLine(line, delimiter);
      
      if (headers && !headerRow) {
        headerRow = values;
        return;
      }

      const row = headers 
        ? Object.fromEntries(headerRow.map((h, i) => [h, values[i]]))
        : values;

      batch.push(row);
      rowIndex++;

      // 达到批次大小时处理
      if (batch.length >= batchSize) {
        rl.pause(); // 背压控制: 暂停读取
        
        try {
          await onBatch(batch, rowIndex);
          results.push(...batch);
          batch = [];
          rl.resume(); // 恢复读取
        } catch (error) {
          reject(error);
          rl.close();
        }
      }
    });

    rl.on('close', async () => {
      // 处理剩余数据
      if (batch.length > 0) {
        try {
          await onBatch(batch, rowIndex);
          results.push(...batch);
        } catch (error) {
          reject(error);
        }
      }
      resolve(results);
    });

    rl.on('error', reject);
  });
}

/**
 * 解析 CSV 行（处理引号内的分隔符）
 */
function parseCSVLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // 跳过下一个引号
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * 流式写入 CSV
 */
function* writeCSVStream(data, options = {}) {
  const { delimiter = ',', headers = true } = options;
  
  // 写入表头
  if (headers && data.length > 0) {
    const headerLine = Object.keys(data[0])
      .map(k => escapeCSVValue(k, delimiter))
      .join(delimiter);
    yield headerLine + '\n';
  }

  // 逐行写入
  for (const row of data) {
    const values = Object.values(row).map(v => escapeCSVValue(v, delimiter));
    yield values.join(delimiter) + '\n';
  }
}

/**
 * 转义 CSV 值
 */
function escapeCSVValue(value, delimiter = ',') {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * 背压控制器
 */
class BackpressureController {
  constructor(maxPending = 5) {
    this.maxPending = maxPending;
    this.pending = 0;
    this.paused = false;
  }

  async acquire() {
    while (this.pending >= this.maxPending) {
      await new Promise(r => setTimeout(r, 100));
    }
    this.pending++;
  }

  release() {
    this.pending--;
  }
}

module.exports = {
  createCSVStream,
  parseCSVLine,
  writeCSVStream,
  BackpressureController,
  // v1.1 新增
  validateCSV,
  getCSVStats
};

/**
 * 验证CSV文件
 * @param {string} filePath - 文件路径
 * @returns {Object} 验证结果
 */
function validateCSV(filePath) {
  const errors = [];
  const warnings = [];
  
  if (!fs.existsSync(filePath)) {
    errors.push('文件不存在');
    return { valid: false, errors, warnings };
  }
  
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    errors.push('文件为空');
    return { valid: false, errors, warnings };
  }
  
  if (stats.size > 100 * 1024 * 1024) {
    warnings.push('文件较大，建议使用流式处理');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * 获取CSV统计信息
 * @param {string} filePath - 文件路径
 * @returns {Object} 统计信息
 */
function getCSVStats(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  let maxCols = 0;
  for (const line of lines.slice(0, 100)) {
    const cols = parseCSVLine(line).length;
    maxCols = Math.max(maxCols, cols);
  }
  
  return {
    totalLines: lines.length,
    estimatedRows: lines.length - 1,  // 假设有表头
    maxColumns: maxCols,
    fileSize: fs.statSync(filePath).size
  };
}
