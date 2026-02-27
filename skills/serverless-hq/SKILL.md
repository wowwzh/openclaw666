# Serverless无服务器技能

完整的Serverless架构指南。

## 函数计算

```javascript
// AWS Lambda
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' })
  };
  return response;
};

// Vercel
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}
```

## 触发器

```javascript
// HTTP
app.http('getUser', {
  route: 'users/{id}',
  handler: async (req, res) => { }
});

// 定时
app.timer('dailyJob', {
  schedule: '0 0 * * *',
  handler: async () => { }
});

// 队列
app.queue('processItem', {
  handler: async (message) => { }
});
```

## 最佳实践

1. 冷启动优化
2. 并行处理
3. 错误重试
