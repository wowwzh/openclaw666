# 输入验证与防注入技能

防止XSS和SQL注入攻击。

## 1. XSS防护

```typescript
function sanitizeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 使用
const safe = sanitizeHTML(userInput);
```

## 2. SQL注入防护

```typescript
// 使用参数化查询
const query = 'SELECT * FROM users WHERE id = $1';
const result = await client.query(query, [userId]);

// 禁止拼接SQL
// ❌ bad: `SELECT * FROM ${table}`
// ✅ good: 'SELECT * FROM users'
```

## 3. 命令注入防护

```typescript
import { execFile } from 'child_process';

// ❌ 禁止使用 exec / spawn with shell
// child_process.exec('ls ' + userInput)

// ✅ 使用 execFile
execFile('ls', [userInput], (err, out) => {});
```

## 4. 正则验证

```typescript
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

## 5. 综合中间件

```typescript
function inputSanitizer(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = sanitizeObject(obj[key]);
    }
  }
  return obj;
}
```

## 规则

| 类型 | 规则 |
|------|------|
| 用户输入 | 必须验证+转义 |
| SQL | 参数化查询 |
| 命令 | 禁止shell执行 |
| 文件名 | 白名单验证 |
| URL | 协议白名单 |
