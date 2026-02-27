# CORS WebView 修复技能

解决移动端WebView的CORS预检请求问题。

## 问题

移动端WebView origin特殊：
- `null`
- `file://`
- `app://`
- `ionic://`
- `capacitor://`

这些非标准origin会导致CORS预检(OPTIONS)失败。

## 解决方案

### 中间件

```typescript
import corsWebview from 'cors-webview-middleware';

// Express
app.use(corsWebview({
  origins: ['null', 'file://', 'app://', 'ionic://', 'capacitor://'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 手动处理

```typescript
app.options('*', (req, res) => {
  const origin = req.headers.origin || 'null';
  if (['null', 'file://', 'app://'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  res.sendStatus(200);
});
```

## 支持框架

- Express
- Koa
- Fastify
- 原生Node.js
