/**
 * CDN 缓存系统
 * CDN Cache System
 * 
 * 特性：
 * - 多层缓存
 * - 缓存预热
 * - 失效策略
 * - 命中率统计
 * 
 * 信号: cdn_cache, cache_invalidation, cache_warmup
 */

class CDNCache {
  constructor(options = {}) {
    this.layers = options.layers || ['memory', 'redis', 'cdn'];
    this.ttl = options.ttl || 3600; // 默认1小时
    this.maxSize = options.maxSize || 1000;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, writes: 0 };
  }

  /**
   * 获取缓存
   */
  async get(key) {
    // 逐层查找
    for (const layer of this.layers) {
      const value = await this.getFromLayer(layer, key);
      if (value !== null) {
        this.stats.hits++;
        // 回填到更快的层
        await this.backfill(key, value, layer);
        return value;
      }
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * 设置缓存
   */
  async set(key, value, options = {}) {
    const ttl = options.ttl || this.ttl;
    const layer = options.layer || this.layers[0];
    
    await this.setToLayer(layer, key, {
      value,
      expiresAt: Date.now() + ttl * 1000
    });
    
    this.stats.writes++;
    
    // 同步到其他层
    if (options.sync) {
      await this.syncToAllLayers(key, value, ttl);
    }
  }

  /**
   * 删除缓存
   */
  async invalidate(key) {
    for (const layer of this.layers) {
      await this.deleteFromLayer(layer, key);
    }
  }

  /**
   * 批量获取
   */
  async getMany(keys) {
    const results = {};
    await Promise.all(
      keys.map(async key => {
        results[key] = await this.get(key);
      })
    );
    return results;
  }

  /**
   * 缓存预热
   */
  async warmup(urls, fetchFn) {
    console.log(`[CDNCache] Warming up ${urls.length} URLs...`);
    
    const results = await Promise.allSettled(
      urls.map(async url => {
        const data = await fetchFn(url);
        await this.set(url, data, { sync: true });
        return { url, status: 'success' };
      })
    );
    
    return results.filter(r => r.status === 'fulfilled');
  }

  /**
   * 获取命中率
   */
  getHitRate() {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%';
  }

  /**
   * 获取统计
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.getHitRate(),
      size: this.cache.size
    };
  }

  // 层级操作
  async getFromLayer(layer, key) {
    if (layer === 'memory') {
      const item = this.cache.get(key);
      if (item && item.expiresAt > Date.now()) {
        return item.value;
      }
      this.cache.delete(key);
    }
    return null;
  }

  async setToLayer(layer, key, value) {
    if (layer === 'memory') {
      if (this.cache.size >= this.maxSize) {
        // LRU淘汰
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, value);
    }
  }

  async deleteFromLayer(layer, key) {
    if (layer === 'memory') {
      this.cache.delete(key);
    }
  }

  async backfill(key, value, sourceLayer) {
    // 从慢层回填到快层
    const sourceIndex = this.layers.indexOf(sourceLayer);
    if (sourceIndex > 0) {
      const targetLayer = this.layers[sourceIndex - 1];
      await this.setToLayer(targetLayer, key, { value, expiresAt: Date.now() + this.ttl * 1000 });
    }
  }

  async syncToAllLayers(key, value, ttl) {
    for (const layer of this.layers) {
      if (layer !== this.layers[0]) {
        await this.setToLayer(layer, key, { value, expiresAt: Date.now() + ttl * 1000 });
      }
    }
  }
}

/**
 * 创建CDN缓存实例
 */
function createCDNCache(options) {
  return new CDNCache(options);
}

module.exports = {
  CDNCache,
  createCDNCache
};
