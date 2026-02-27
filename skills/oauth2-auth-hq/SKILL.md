# OAuth2认证授权技能

完整的OAuth2实现指南。

## 流程

```
User → App → Authorization Server → Token → Resource Server
```

## 授权类型

### 1. Authorization Code

```javascript
// 服务端
const authUrl = `https://auth.example.com/authorize?
  client_id=${CLIENT_ID}
  &redirect_uri=${REDIRECT_URI}
  &response_type=code
  &scope=read:profile
  &state=${randomState}`;

// 回调处理
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // 交换token
  const tokenRes = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })
  });
  
  const tokens = await tokenRes.json();
  // { access_token, refresh_token, expires_in }
});
```

### 2. PKCE扩展

```javascript
// 生成code verifier和challenge
const crypto = require('crypto');

function generatePKCE() {
  const verifier = base64Url(crypto.randomBytes(32));
  const challenge = base64Url(
    crypto.createHash('sha256').update(verifier).digest()
  );
  return { verifier, challenge };
}

// Auth URL with PKCE
const { verifier, challenge } = generatePKCE();
const authUrl = `https://auth.example.com/authorize?
  client_id=${CLIENT_ID}
  &code_challenge=${challenge}
  &code_challenge_method=S256
  &response_type=code
  ...`;
```

### 3. Client Credentials

```javascript
// 服务器间通信
const tokenRes = await fetch('https://auth.example.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'read:admin'
  })
});
```

### 4. Refresh Token

```javascript
// 刷新token
async function refreshToken(refreshToken) {
  const tokenRes = await fetch('https://auth.example.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });
  
  return tokenRes.json();
}
```

## 验证Token

```javascript
// 中间件验证
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  
  const token = authHeader.slice(7);
  
  try {
    // 验证token
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// JWT验证
async function verifyToken(token) {
  const publicKey = await getPublicKey();
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
}
```

## Scope管理

```javascript
// 定义scope
const SCOPES = {
  'read:profile': '读取个人信息',
  'write:profile': '修改个人信息',
  'read:orders': '读取订单',
  'admin': '管理员权限'
};

// 验证scope
function requireScope(...required) {
  return (req, res, next) => {
    const userScopes = req.user.scopes || [];
    const hasScope = required.every(s => userScopes.includes(s));
    
    if (!hasScope) {
      return res.status(403).json({ error: 'Insufficient scope' });
    }
    next();
  };
}

app.get('/profile', authenticate, requireScope('read:profile'), handler);
```

## 实现示例

```javascript
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();

// 授权端点
app.get('/auth/authorize', (req, res) => {
  const { client_id, redirect_uri, response_type, state, code_challenge } = req.query;
  
  // 验证client
  if (!validClient(client_id, redirect_uri)) {
    return res.status(400).json({ error: 'invalid_client' });
  }
  
  // 生成授权码
  const code = crypto.randomBytes(32).toString('hex');
  
  // 保存code和state
  authCodes.set(code, { client_id, redirect_uri, code_challenge, scope: req.query.scope });
  
  const redirect = `${redirect_uri}?code=${code}&state=${state}`;
  res.redirect(redirect);
});

// Token端点
app.post('/auth/token', async (req, res) => {
  const { grant_type, code, client_id, client_secret, code_verifier } = req.body;
  
  if (grant_type === 'authorization_code') {
    const authCode = authCodes.get(code);
    
    // 验证PKCE
    if (authCode?.code_challenge) {
      const challenge = base64Url(
        crypto.createHash('sha256').update(code_verifier).digest()
      );
      if (challenge !== authCode.code_challenge) {
        return res.status(400).json({ error: 'invalid_grant' });
      }
    }
    
    // 生成token
    const accessToken = jwt.sign(
      { client_id, scope: authCode.scope },
      privateKey,
      { algorithm: 'RS256', expiresIn: 3600 }
    );
    
    res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 3600 });
  }
});
```

## 最佳实践

1. **使用HTTPS** - 保护传输安全
2. **PKCE** - 必选，防止code拦截
3. **短有效期Token** - 15-60分钟
4. **Refresh Token** - 长期访问
5. **Scope限制** - 最小权限原则
6. **状态验证** - 防止CSRF
7. **Token存储** - 安全存储，不要URL
