# Data Pipeline数据管道技能

完整的ETL数据处理管道。

## 架构

```
Source → Extract → Transform → Load → Destination
         ↓
     监控/日志
```

## Node.js实现

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

async function etlPipeline(config) {
  const { source, transform, destination } = config;
  
  const readStream = fs.createReadStream(source);
  const transformStream = transform();
  const writeStream = fs.createWriteStream(destination);
  
  await pipeline(readStream, transformStream, writeStream);
}
```

## 数据抽取

```javascript
// 数据库
async function extractFromDB(query) {
  const client = new Client(connectionString);
  await client.connect();
  const result = await client.query(query);
  await client.end();
  return result.rows;
}

// API
async function extractFromAPI(url, options = {}) {
  const response = await fetch(url, options);
  return response.json();
}

// 文件
async function extractFromFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  return parse(data);
}
```

## 数据转换

```javascript
// 转换流
const { Transform } = require('stream');

const transform = new Transform({
  transform(chunk, encoding, callback) {
    const data = JSON.parse(chunk);
    // 转换逻辑
    const transformed = {
      id: data.id,
      name: data.name.toUpperCase(),
      timestamp: new Date()
    };
    callback(null, JSON.stringify(transformed) + '\n');
  }
});
```

## 数据加载

```javascript
// 批量插入
async function loadToDB(data, tableName) {
  const client = new Client(connectionString);
  await client.connect();
  
  const batchSize = 1000;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map((_, i) => 
      batch.map((_, j) => `$${i * batch.length + j + 1}`).join(',')
    ).join('),(');
    
    await client.query(
      `INSERT INTO ${tableName} VALUES ${values}`,
      batch.flat()
    );
  }
  
  await client.end();
}
```

## 错误处理

```javascript
async function pipelineWithRetry(config, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await etlPipeline(config);
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}
```

## 监控

```javascript
const metrics = {
  recordsProcessed: 0,
  errors: 0,
  startTime: Date.now()
};

transformStream.on('data', () => {
  metrics.recordsProcessed++;
});

transformStream.on('error', (err) => {
  metrics.errors++;
  console.error('Transform error:', err);
});
```

## 调度

```yaml
# cron
0 * * * * /usr/bin/node /app/pipeline.js
```

## 最佳实践

1. **流处理** - 大数据用流
2. **批量** - 减少数据库IO
3. **重试** - 失败自动重试
4. **监控** - 记录进度/错误
5. **断点续传** - 从失败处继续
