/**
 * Anomaly Detection - 异常数据检测
 * 基于中位数和3倍标准差检测异常值
 */

class AnomalyDetector {
  constructor(options = {}) {
    this.method = options.method || 'iqr'; // iqr, zscore, mad
    this.threshold = options.threshold || 3;
  }

  /**
   * 计算中位数
   */
  median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * 计算IQR（四分位距）
   */
  iqr(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor(sorted.length * 3 / 4)];
    return q3 - q1;
  }

  /**
   * 检测异常值（使用IQR方法）
   */
  detect(values) {
    if (this.method === 'iqr') {
      return this._detectIQR(values);
    } else if (this.method === 'zscore') {
      return this._detectZScore(values);
    } else if (this.method === 'mad') {
      return this._detectMAD(values);
    }
    return [];
  }

  /**
   * IQR方法
   */
  _detectIQR(values) {
    const q1 = this.percentile(values, 25);
    const q3 = this.percentile(values, 75);
    const iqr = q3 - q1;
    const lower = q1 - this.threshold * iqr;
    const upper = q3 + this.threshold * iqr;

    return values.map((v, i) => ({ index: i, value: v, anomaly: v < lower || v > upper }));
  }

  /**
   * Z-Score方法
   */
  _detectZScore(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    
    return values.map((v, i) => ({
      index: i,
      value: v,
      zscore: std ? (v - mean) / std : 0,
      anomaly: std && Math.abs((v - mean) / std) > this.threshold
    }));
  }

  /**
   * MAD方法（中位数绝对偏差）
   */
  _detectMAD(values) {
    const med = this.median(values);
    const mad = this.median(values.map(v => Math.abs(v - med)));
    const threshold = this.threshold * mad;

    return values.map((v, i) => ({
      index: i,
      value: v,
      deviation: Math.abs(v - med),
      anomaly: mad && Math.abs(v - med) > threshold
    }));
  }

  percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
  }
}

module.exports = { AnomalyDetector };
