/**
 * 异常数据检测模块
 * 使用中位数3倍阈值检测异常数据点
 * 
 * 原理：计算中位数，然后标记超过3倍中位数的点为异常
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加更多统计函数
 * - 添加Z-Score检测器
 * - 改进实时检测
 */

/** @typedef {{value: number, zScore: number}} AnomalyItem */
/** @typedef {{anomalies: AnomalyItem[], clean: number[], median: number, mad: number, threshold: number}} DetectResult */

/**
 * 计算中位数
 * @param {number[]} arr - 数据数组
 * @returns {number} 中位数
 */
function median(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * 检测异常数据点
 * @param {number[]} data - 数据数组
 * @param {number} threshold - 阈值倍数 (默认3)
 * @returns {object} - { anomalies: number[], clean: number[] }
 */
function detectAnomalies(data, threshold = 3) {
  if (!data || data.length === 0) {
    return { anomalies: [], clean: [], median: 0 };
  }

  const med = median(data);
  const mad = median(data.map(x => Math.abs(x - med))); // 中位数绝对偏差
  
  const anomalies = [];
  const clean = [];
  
  for (const value of data) {
    const zScore = mad === 0 ? 0 : Math.abs(value - med) / mad;
    if (zScore > threshold) {
      anomalies.push({ value, zScore: zScore.toFixed(2) });
    } else {
      clean.push(value);
    }
  }
  
  return {
    anomalies,
    clean,
    median: med,
    mad,
    threshold
  };
}

/**
 * 实时流异常检测
 */
class AnomalyDetector {
  constructor(options = {}) {
    this.windowSize = options.windowSize || 100;
    this.threshold = options.threshold || 3;
    this.buffer = [];
  }

  /**
   * 添加数据点
   */
  add(value) {
    this.buffer.push(value);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }
    
    if (this.buffer.length >= 10) {
      return this.detect();
    }
    return null;
  }

  /**
   * 检测异常
   */
  detect() {
    return detectAnomalies(this.buffer, this.threshold);
  }

  /**
   * 重置缓冲区
   */
  reset() {
    this.buffer = [];
  }
}

module.exports = {
  detectAnomalies,
  median,
  AnomalyDetector
};
