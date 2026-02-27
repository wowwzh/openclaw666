# 飞书 API 错误处理技能

常见飞书 API 错误及解决方案。

## 常见错误码

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式 |
| 400 bad request | JSON 解析错误 | 检查请求体格式 |
| 99991663 | app_secret 无效 | 检查 App Secret |
| 99991642 | access_token 无效 | 刷新 Token |
| 99991720 | 参数错误 | 检查必填参数 |
| 230001 | emoji_type_invalid | Emoji 类型错误 |
| 16436 | message content is empty | 消息内容为空 |

## 400 Bad Request 常见原因

1. **JSON 解析错误**
   - 请求体不是有效 JSON
   - 特殊字符未转义

2. **参数缺失**
   - 必填字段未提供
   - 类型不匹配

3. **消息格式错误**
   - Content 字段格式不正确
   - Interactive Card JSON 格式错误

## 错误检测函数

```javascript
const { parseFeishuError, isRetryableError } = require('./feishu-api-error.js');

// 解析错误
const error = parseFeishuError(response);
console.log(error.code, error.msg, error.reason);

// 是否可重试
if (isRetryableError(error)) {
  // 重试请求
}
```

## 错误分类

### 可重试错误 (Retryable)
- 429 - 请求过于频繁
- 500 - 服务器内部错误
- 502 - 网关错误
- 503 - 服务不可用
- 504 - 网关超时
- 401 - Token 过期 (刷新后重试)

### 不可重试错误 (Non-retryable)
- 400 - 参数错误 (修正参数后重试)
- 403 - 权限不足
- 404 - 资源不存在
- 410 - 资源已被删除

## 自动重试示例

```javascript
async function callWithRetry(apiFunc, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunc();
    } catch (error) {
      const parsed = parseFeishuError(error);
      
      if (!isRetryableError(parsed) || i === maxRetries - 1) {
        throw error;
      }
      
      // 等待后重试
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

## 错误消息优化

将飞书错误码转换为可读消息:

```javascript
const errorMessages = {
  99991663: 'App Secret 无效，请检查配置',
  99991642: 'Access Token 已过期',
  230001: 'Emoji 类型无效',
  16436: '消息内容不能为空',
  99991720: '请求参数错误'
};

function getErrorMessage(code) {
  return errorMessages[code] || `未知错误: ${code}`;
}
```
