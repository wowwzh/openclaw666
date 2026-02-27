/**
 * OAuth权限系统
 * OAuth Scope System
 * 
 * 特性：
 * - 权限定义
 * - 作用域验证
 * - 权限升级
 * - 令牌刷新
 * 
 * 信号: oauth_scope, authorization, permission
 */

// 预定义权限级别
const SCOPES = {
  // 读取权限
  'read:profile': '读取用户资料',
  'read:email': '读取邮箱',
  'read:files': '读取文件',
  
  // 写入权限
  'write:profile': '修改用户资料',
  'write:files': '上传/修改文件',
  'write:message': '发送消息',
  
  // 管理权限
  'admin:users': '管理用户',
  'admin:settings': '系统设置',
  'admin:billing': '账单管理',
  
  // 最高权限
  'root': '超级管理员'
};

// 权限级别（数字越大越高）
const SCOPE_LEVELS = {
  'read:profile': 1,
  'read:email': 1,
  'read:files': 1,
  'write:profile': 2,
  'write:files': 2,
  'write:message': 2,
  'admin:users': 3,
  'admin:settings': 3,
  'admin:billing': 3,
  'root': 10
};

class OAuthScope {
  constructor(options = {}) {
    this.scopes = options.scopes || [];
    this.requiredScopes = options.requiredScopes || [];
    this.tokenEndpoint = options.tokenEndpoint;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
  }

  /**
   * 验证权限
   */
  hasScope(requiredScope) {
    const requiredLevel = SCOPE_LEVELS[requiredScope] || 0;
    
    for (const scope of this.scopes) {
      const userLevel = SCOPE_LEVELS[scope] || 0;
      if (userLevel >= requiredLevel) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 验证多个权限
   */
  hasScopes(requiredScopes) {
    return requiredScopes.every(scope => this.hasScope(scope));
  }

  /**
   * 获取用户权限描述
   */
  getScopeDescriptions() {
    return this.scopes.map(scope => ({
      scope,
      description: SCOPES[scope] || '未知权限'
    }));
  }

  /**
   * 请求权限
   */
  async requestScope(requiredScope) {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const authUrl = new URL(this.tokenEndpoint);
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', requiredScope);
    
    window.location.href = authUrl.toString();
  }

  /**
   * 交换令牌
   */
  async exchangeToken(code) {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();
    this.scopes = data.scope?.split(' ') || [];
    
    return data;
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken) {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.scopes = data.scope?.split(' ') || [];
    
    return data;
  }

  /**
   * 撤销令牌
   */
  async revokeToken(token) {
    await fetch(`${this.tokenEndpoint}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });
    
    this.scopes = [];
  }

  /**
   * 检查权限不足时需要的权限
   */
  getMissingScopes() {
    return this.requiredScopes.filter(scope => !this.hasScope(scope));
  }

  /**
   * 权限升级请求
   */
  requestScopeUpgrade(newScope) {
    const missing = this.getMissingScopes();
    if (missing.includes(newScope)) {
      return this.requestScope(newScope);
    }
    return Promise.resolve({ already_has: true });
  }
}

/**
 * 创建OAuth权限实例
 */
function createOAuthScope(options) {
  return new OAuthScope(options);
}

module.exports = {
  OAuthScope,
  createOAuthScope,
  SCOPES,
  SCOPE_LEVELS
};
