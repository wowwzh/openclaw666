/**
 * DNS解析系统
 * DNS Resolution System
 * 
 * 特性：
 * - 多DNS服务器
 * - 缓存管理
 * - 故障转移
 * - 解析统计
 * 
 * 信号: dns_resolution, dns_cache, failover
 */

const dns = require('dns').promises;
const dnsSync = require('dns');

class DNSResolver {
  constructor(options = {}) {
    this.servers = options.servers || [
      { host: '8.8.8.8', name: 'Google', priority: 1 },
      { host: '1.1.1.1', name: 'Cloudflare', priority: 2 },
      { host: '114.114.114.114', name: '114DNS', priority: 3 }
    ];
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 300; // 5分钟
    this.timeout = options.timeout || 5000;
    this.stats = { hits: 0, misses: 0, errors: 0 };
  }

  /**
   * 解析域名
   */
  async resolve(hostname, options = {}) {
    const { useCache = true, forceRefresh = false } = options;
    
    // 检查缓存
    if (useCache && !forceRefresh) {
      const cached = this.cache.get(hostname);
      if (cached && cached.expiresAt > Date.now()) {
        this.stats.hits++;
        return cached.records;
      }
    }
    
    this.stats.misses++;
    
    // 尝试各DNS服务器
    for (const server of this.servers) {
      try {
        const records = await this.resolveWithServer(hostname, server);
        
        // 缓存结果
        this.cache.set(hostname, {
          records,
          expiresAt: Date.now() + this.cacheTTL * 1000,
          server: server.name
        });
        
        return records;
      } catch (error) {
        console.log(`[DNS] Server ${server.name} failed:`, error.message);
        continue;
      }
    }
    
    this.stats.errors++;
    throw new Error(`DNS resolution failed for ${hostname}`);
  }

  /**
   * 使用指定服务器解析
   */
  async resolveWithServer(hostname, server) {
    const originalDns = dns.getServers();
    
    try {
      // 设置DNS服务器
      dns.setServers([server.host]);
      
      // 并行查询A和AAAA记录
      const [a, aaaa] = await Promise.all([
        this.resolveWithTimeout(dns.resolve4(hostname), this.timeout),
        this.resolveWithTimeout(dns.resolve6(hostname), this.timeout).catch(() => [])
      ]);
      
      // 查询CNAME
      const cname = await this.resolveWithTimeout(dns.resolveCname(hostname), this.timeout)
        .catch(() => []);
      
      // 查询MX
      const mx = await this.resolveWithTimeout(dns.resolveMx(hostname), this.timeout)
        .catch(() => []);
      
      // 查询TXT
      const txt = await this.resolveWithTimeout(dns.resolveTxt(hostname), this.timeout)
        .catch(() => []);
      
      return {
        hostname,
        addresses: [...a, ...aaaa],
        cname: cname[0] || null,
        mx: mx.map(m => ({ priority: m.priority, exchange: m.exchange })),
        txt: txt[0] || [],
        resolvedBy: server.name,
        timestamp: Date.now()
      };
      
    } finally {
      // 恢复DNS服务器
      dns.setServers(originalDns);
    }
  }

  /**
   * 超时控制
   */
  resolveWithTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ]);
  }

  /**
   * 解析IPv4
   */
  async resolve4(hostname) {
    return await this.resolve(hostname, { useCache: true });
  }

  /**
   * 解析IPv6
   */
  async resolve6(hostname) {
    const result = await this.resolve(hostname, { useCache: true });
    return result.addresses.filter(a => a.includes(':'));
  }

  /**
   * 故障转移
   */
  async resolveWithFailover(hostname, endpoints) {
    for (const endpoint of endpoints) {
      try {
        const url = new URL(endpoint);
        const records = await this.resolve(url.hostname);
        
        if (records.addresses.length > 0) {
          return {
            endpoint,
            address: records.addresses[0],
            success: true
          };
        }
      } catch {
        continue;
      }
    }
    
    return { success: false };
  }

  /**
   * 预热缓存
   */
  async warmup(hostnames) {
    console.log(`[DNS] Warming up cache for ${hostnames.length} hostnames...`);
    
    const results = await Promise.allSettled(
      hostnames.map(h => this.resolve(h, { useCache: false }))
    );
    
    return results.map((r, i) => ({
      hostname: hostnames[i],
      success: r.status === 'fulfilled'
    }));
  }

  /**
   * 清除缓存
   */
  clearCache(hostname) {
    if (hostname) {
      this.cache.delete(hostname);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取统计
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size
    };
  }

  /**
   * 本地解析（同步）
   */
  resolveSync(hostname) {
    return dnsSync.resolve4(hostname);
  }
}

/**
 * 创建DNS解析器
 */
function createDNSResolver(options) {
  return new DNSResolver(options);
}

module.exports = {
  DNSResolver,
  createDNSResolver
};
