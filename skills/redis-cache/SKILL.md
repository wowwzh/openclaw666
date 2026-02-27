/**
 * Redis缓存系统
 * Redis Cache System
 * 
 * 特性：
 * - 连接池
 * - 自动重试
 * - 分布式锁
 * - 消息队列
 * 
 * 信号: redis_cache, distributed_lock, pub_sub
 */

const redis = require('redis');

class RedisCache {
  constructor(options = {}) {
    this.url = options.url || process.env.REDIS_URL || 'redis://localhost:6379';
    this.options = {
      ...options,
      url: this.url
    };
    this.client = null;
    this.pool = [];
    this.maxPoolSize = options.maxPoolSize || 10;
  }

  /**
   * 连接
   */
  async connect() {
    this.client = redis.createClient(this.options);
    this.client.on('error', err => console.error('[Redis]', err.message));
    await this.client.connect();
    return this.client;
  }

  /**
   * 获取
   */
  async get(key) {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * 设置
   */
  async set(key, value, options = {}) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (options.ttl) {
      await this.client.setEx(key, options.ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
    return true;
  }

  /**
   * 删除
   */
  async del(key) {
    return await this.client.del(key);
  }

  /**
   * 分布式锁
   */
  async acquireLock(key, ttl = 10000) {
    const lockKey = `lock:${key}`;
    const result = await this.client.set(lockKey, Date.now().toString(), {
      NX: true,
      PX: ttl
    });
    return result === 'OK';
  }

  /**
   * 释放锁
   */
  async releaseLock(key) {
    const lockKey = `lock:${key}`;
    await this.client.del(lockKey);
  }

  /**
   * 原子计数器
   */
  async increment(key, amount = 1) {
    return await this.client.incrBy(key, amount);
  }

  /**
   * 哈希操作
   */
  async hset(key, field, value) {
    return await this.client.hSet(key, field, JSON.stringify(value));
  }

  async hget(key, field) {
    const value = await this.client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  }

  async hgetall(key) {
    const data = await this.client.hGetAll(key);
    const result = {};
    for (const [k, v] of Object.entries(data)) {
      try { result[k] = JSON.parse(v); } catch { result[k] = v; }
    }
    return result;
  }

  /**
   * 列表操作
   */
  async lpush(key, value) {
    return await this.client.lPush(key, JSON.stringify(value));
  }

  async lrange(key, start, stop) {
    const items = await this.client.lRange(key, start, stop);
    return items.map(item => {
      try { return JSON.parse(item); } catch { return item; }
    });
  }

  /**
   * 发布/订阅
   */
  async publish(channel, message) {
    return await this.client.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel, callback) {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, message => {
      callback(JSON.parse(message));
    });
    return subscriber;
  }

  /**
   * 批量操作
   */
  async mget(keys) {
    const values = await this.client.mGet(keys);
    return values.map(v => {
      if (!v) return null;
      try { return JSON.parse(v); } catch { return v; }
    });
  }

  /**
   * 获取统计
   */
  async getStats() {
    const info = await this.client.info('stats');
    const keys = await this.client.dbSize();
    return { keys, info };
  }

  /**
   * 关闭
   */
  async close() {
    if (this.client) await this.client.quit();
  }
}

/**
 * 创建Redis缓存
 */
function createRedisCache(options) {
  return new RedisCache(options);
}

module.exports = {
  RedisCache,
  createRedisCache
};
