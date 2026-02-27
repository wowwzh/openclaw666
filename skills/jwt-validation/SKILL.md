/**
 * JWT验证系统
 * JWT Validation System
 * 
 * 特性：
 * - 签名验证
 * - 过期检查
 * - 权限验证
 * - 密钥轮换
 * 
 * 信号: jwt_validation, token_verify, authorization
 */

const crypto = require('crypto');

class JWTValidator {
  constructor(options = {}) {
    this.secret = options.secret || process.env.JWT_SECRET;
    this.algorithm = options.algorithm || 'HS256';
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.leeway = options.leeway || 0; // 允许的时间误差
  }

  /**
   * 验证JWT
   */
  async verify(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 验证签名
    const signature = this.base64UrlDecode(signatureB64);
    const data = `${headerB64}.${payloadB64}`;
    const expectedSignature = this.sign(data);

    if (!this.constantTimeCompare(signature, expectedSignature)) {
      throw new Error('Invalid signature');
    }

    // 解析payload
    const payload = JSON.parse(this.base64UrlDecode(payloadB64));

    // 验证过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now + this.leeway) {
      throw new Error('Token expired');
    }

    // 验证生效时间
    if (payload.nbf && payload.nbf > now - this.leeway) {
      throw new Error('Token not yet valid');
    }

    // 验证发行者
    if (this.issuer && payload.iss !== this.issuer) {
      throw new Error('Invalid issuer');
    }

    // 验证受众
    if (this.audience) {
      const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!aud.includes(this.audience)) {
        throw new Error('Invalid audience');
      }
    }

    return payload;
  }

  /**
   * 签名
   */
  sign(data) {
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(data);
    return hmac.digest();
  }

  /**
   * Base64URL解码
   */
  base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  /**
   * 常数时间比较（防止时序攻击）
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  /**
   * 生成JWT
   */
  sign(payload, options = {}) {
    const header = {
      alg: this.algorithm,
      typ: 'JWT'
    };

    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      ...(options.issuer && { iss: options.issuer }),
      ...(options.audience && { aud: options.audience }),
      ...(options.expiresIn && { exp: now + options.expiresIn })
    };

    const payloadB64 = this.base64UrlEncode(JSON.stringify(fullPayload));
    const signature = this.sign(`${headerB64}.${payloadB64}`);
    const signatureB64 = this.base64UrlEncode(signature);

    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  /**
   * Base64URL编码
   */
  base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * 密钥轮换
   */
  rotateSecret(newSecret) {
    const oldSecret = this.secret;
    this.secret = newSecret;
    return { rotated: true, oldSecret };
  }

  /**
   * 验证多个密钥（支持密钥轮换）
   */
  async verifyWithRotation(token, secrets) {
    for (const secret of secrets) {
      const validator = new JWTValidator({ ...this, secret });
      try {
        return await validator.verify(token);
      } catch (error) {
        if (error.message === 'Invalid signature') {
          continue;
        }
        throw error;
      }
    }
    throw new Error('Invalid signature');
  }
}

/**
 * 创建JWT验证器
 */
function createJWTValidator(options) {
  return new JWTValidator(options);
}

module.exports = {
  JWTValidator,
  createJWTValidator
};
