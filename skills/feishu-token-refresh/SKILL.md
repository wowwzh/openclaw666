# 飞书 Token 刷新技能

自动检测并刷新过期的飞书 Access Token。

## 错误场景

- `401 unauthorized` - Token 过期
- `99991663` - app_secret 无效
- `99991642` - access_token 无效

## 刷新原理

飞书 Access Token 有效期为 **2 小时**，需要使用 App ID + App Secret 换新 Token。

## 刷新 API

```
POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
```

请求体:
```json
{
  "app_id": "cli_xxxxx",
  "app_secret": "xxxxx"
}
```

## 使用方法

```javascript
const { refreshToken } = require('./feishu-token-refresh.js');

async function main() {
  // 刷新 Token
  const result = await refreshToken('cli_xxxxx', 'xxxxx');
  
  if (result.success) {
    console.log('新 Token:', result.access_token);
    console.log('有效期:', result.expires_in, '秒');
  } else {
    console.error('刷新失败:', result.error);
  }
}
```

## 错误码

| 错误码 | 含义 | 处理 |
|--------|------|------|
| 99991663 | app_secret 无效 | 检查 App Secret 是否正确 |
| 99991642 | access_token 无效 | 重新获取 Token |
| 99991664 | invalid app_id | 检查 App ID 是否正确 |

## 集成到现有代码

在调用飞书 API 时添加重试逻辑:

```javascript
async function callFeishuAPIWithRetry(url, options, appId, appSecret) {
  const response = await fetch(url, options);
  
  if (response.code === 401 || response.code === 99991642) {
    // Token 过期，刷新
    const newToken = await refreshToken(appId, appSecret);
    if (newToken.success) {
      // 重试请求
      options.headers['Authorization'] = `Bearer ${newToken.access_token}`;
      return fetch(url, options);
    }
  }
  
  return response;
}
```
