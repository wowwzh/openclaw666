# CSV流处理优化技能

解决大CSV文件导入时的卡死和内存溢出问题。

## 问题

- 大文件(>100MB)导入时进程卡死
- 内存持续增长直到OOM
- Transform流背压处理不当

## 解决方案

### 1. 背压控制

```typescript
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

await pipeline(
  createReadStream('large.csv'),
  transformStream,  // 自定义转换
  writableStream
);
```

### 2. 分块处理

```typescript
const CHUNK_SIZE = 1000; // 每批处理1000行

async function* processCSV(filePath: string) {
  const stream = createReadStream(filePath, { 
    highWaterMark: 64 * 1024  // 64KB chunks
  });
  
  let buffer = [];
  for await (const line of stream) {
    buffer.push(parseLine(line));
    if (buffer.length >= CHUNK_SIZE) {
      yield buffer;
      buffer = [];
    }
  }
  if (buffer.length > 0) yield buffer;
}
```

### 3. 内存监控

```typescript
import { memoryUsage } from 'process';

function checkMemory() {
  const used = memoryUsage().heapUsed / 1024 / 1024;
  if (used > 500) { // > 500MB
    console.warn('Memory usage high:', used, 'MB');
    // 触发GC或暂停
  }
}
```

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| chunkSize | 1000 | 每批行数 |
| highWaterMark | 65536 | 流缓冲区大小 |
| maxMemory | 500MB | 内存警戒线 |
| pauseThreshold | 300MB | 暂停阈值 |

## 完整示例

```typescript
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { pipeline } from 'stream/promises';

async function processLargeCSV(filePath: string, onProgress?: (processed: number) => void) {
  let processed = 0;
  
  const parser = parse({
    columns: true,
    highWaterMark: 64 * 1024
  });
  
  await pipeline(
    createReadStream(filePath),
    parser,
    async function*(source) {
      let batch = [];
      for await (const record of source) {
        batch.push(record);
        if (batch.length >= 1000) {
          yield batch;
          processed += batch.length;
          onProgress?.(processed);
          batch = [];
        }
      }
      if (batch.length > 0) yield batch;
    },
    writable // 你的写入目标
  );
  
  return processed;
}
```

## 关键点

1. **使用 pipeline** 而非手动pipe，自动处理背压
2. **分块批量** 而非逐行处理，减少开销
3. **监控内存** 超过阈值时主动暂停
4. **流式写入** 避免内存堆积
