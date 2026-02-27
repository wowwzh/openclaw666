# 异步错误处理技能

处理Promise rejection和async错误。

## 问题

```
UnhandledPromiseRejectionWarning: Promise rejection
Error: Unhandled promise rejection
```

## 解决方案

### 1. 全局捕获

```javascript
// 捕获未处理的Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // 记录日志
  // 发送告警
});

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

### 2. Async/Await错误处理

```javascript
// ❌ 错误
async function bad() {
  const data = await fetch(url); // 如果失败会抛出
  return data;
}

// ✅ 正确
async function good() {
  try {
    const data = await fetch(url);
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    return null; // 或抛出自定义错误
  }
}
```

### 3. Promise重试

```javascript
async function retry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * 2 ** i));
    }
  }
}

// 使用
const data = await retry(() => fetch(url));
```

### 4. 安全Promise包装

```javascript
const safePromise = (promise) => 
  promise
    .then(data => [null, data])
    .catch(err => [err, null]);

// 使用
const [err, data] = await safePromise(fetch(url));
if (err) {
  console.error(err);
}
```

### 5. 统一错误处理

```javascript
class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function handleError(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError) {
      return { error: e.message, code: e.code };
    }
    return { error: 'Internal error', code: 'INTERNAL' };
  }
}
```

## 最佳实践

| 实践 | 说明 |
|------|------|
| 总是try/catch | async函数必须捕获错误 |
| 全局监听 | 捕获遗漏的错误 |
| 重试机制 | 网络请求需要重试 |
| 包装函数 | safePromise统一处理 |
| 自定义错误 | AppError统一错误格式 |
