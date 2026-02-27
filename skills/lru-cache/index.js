/**
 * LRU Cache - 最近最少使用缓存
 * 
 * 双向链表 + Map 实现 O(1) 访问
 */

class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * 获取值
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    // 移到末尾（最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  /**
   * 设置值
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最旧的（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * 检查是否存在
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * 删除
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * 清空
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 获取大小
   */
  size() {
    return this.cache.size;
  }

  /**
   * 获取所有keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有values
   */
  values() {
    return Array.from(this.cache.values());
  }

  /**
   * 转换为对象
   */
  toObject() {
    const obj = {};
    for (const [key, value] of this.cache) {
      obj[key] = value;
    }
    return obj;
  }
}

module.exports = { LRUCache };
