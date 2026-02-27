# Cloudflare Markdown 优化技能

让AI请求返回Markdown格式，减少80% token消耗。

## 问题

AI Agent发送HTTP请求获取网页时，默认收到HTML：
- 标签多，token消耗大
- 需要额外解析

## 解决方案

添加请求头：

```typescript
fetch(url, {
  headers: {
    'Accept': 'text/markdown, text/html'
  }
});
```

## 效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| Token消耗 | 100% | ~20% |
| 响应大小 | 大 | 小 |

## 响应头

服务器返回：
```
x-markdown-tokens: 1500
```

用于估算token预算。

## 使用

```typescript
const response = await fetch(url, {
  headers: {
    'Accept': 'text/markdown, text/html'
  }
});

const contentType = response.headers.get('content-type');
if (contentType.includes('markdown')) {
  // 直接使用markdown
} else {
  // 降级到HTML
}
```
