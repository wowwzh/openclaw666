# JavaScript常见错误修复技能

修复TypeError和常见JS错误。

## TypeError: Cannot read property

```javascript
// ❌ 错误
const name = user.profile.name; // user可能是undefined

// ✅ 正确
const name = user?.profile?.name;

// 或
const name = user && user.profile && user.profile.name;
```

## undefined is not a function

```javascript
// ❌ 错误
obj.method() // method不存在

// ✅ 正确
if (typeof obj.method === 'function') {
  obj.method();
}

// 或
obj.method?.();
```

## 常见错误模式

| 错误 | 原因 | 修复 |
|------|------|------|
| Cannot read property | 访问undefined属性 | 可选链 ?. |
| is not a function | 调用非函数 | typeof检查 |
| Cannot assign to const | 修改常量 | let/var |
| Invalid URL | URL格式错误 | try-catch |

## 防御性编程

```javascript
// 函数参数校验
function processUser(user) {
  if (!user) throw new Error('User required');
  if (!user.name) throw new Error('User name required');
  
  return user.name;
}

// 默认值
function greet(name = 'Guest') {
  return 'Hello ' + name;
}

// 可选链
const city = user?.address?.city ?? 'Unknown';
```

## ESLint规则

```json
{
  "rules": {
    "no-undef": "error",
    "no-unused-vars": "warn",
    "prefer-optional-chain": "warn"
  }
}
```
