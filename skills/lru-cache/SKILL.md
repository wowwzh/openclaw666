---
name: lru-cache
description: LRU缓存 - 最近最少使用缓存实现，O(1)时间复杂度，支持容量限制
---

# LRU Cache

最近最少使用缓存实现。

## 功能

- O(1) 读写复杂度
- 可配置容量
- 自动淘汰最旧数据

## 使用方法

```javascript
const { LRUCache } = require('skills/lru-cache');

const cache = new LRUCache(3);

cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

console.log(cache.get('a')); // 1
cache.set('d', 4); // 淘汰 'b'
console.log(cache.get('b')); // null
```

## API

| 方法 | 说明 |
|------|------|
| get(key) | 获取值 |
| set(key, value) | 设置值 |
| has(key) | 检查存在 |
| delete(key) | 删除 |
| clear() | 清空 |
| size() | 大小 |
