/**
 * MySQL Connection Manager - MySQL连接管理
 * 处理连接超时和查询稳定
 */

class MySQLConnectionManager {
  constructor(options = {}) {
    this.host = options.host || 'localhost';
    this.port = options.port || 3306;
    this.user = options.user;
    this.password = options.password;
    this.database = options.database;
    this.pool = null;
    this.poolConfig = {
      connectionLimit: options.connectionLimit || 10,
      waitForConnections: true,
      queueLimit: 0,
      connectTimeout: options.connectTimeout || 10000,
      idleTimeout: options.idleTimeout || 60000
    };
  }

  /**
   * 初始化连接池
   */
  async init() {
    const mysql = require('mysql2/promise');
    this.pool = mysql.createPool({
      ...this.poolConfig,
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: this.database
    });
    return this;
  }

  /**
   * 获取连接（带超时）
   */
  async getConnection(timeout = 10000) {
    const connection = await Promise.race([
      this.pool.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), timeout)
      )
    ]);
    return connection;
  }

  /**
   * 执行查询（带重试）
   */
  async query(sql, params, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const connection = await this.getConnection();
        const [rows] = await connection.query(sql, params);
        connection.release();
        return rows;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.sleep(1000 * Math.pow(2, i)); // 指数退避
      }
    }
  }

  /**
   * 事务执行
   */
  async transaction(callback) {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return { status: 'healthy', timestamp: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: Date.now() };
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = { MySQLConnectionManager };
