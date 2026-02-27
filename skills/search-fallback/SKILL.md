# 搜索失败自动切换技能

当主搜索API失败时，自动切换到备用搜索引擎。

## 功能

1. **主搜索**：Tavily / Brave Search（首选）
2. **备用搜索**：Baidu Search API
3. **第三选择**：Kimi 智能搜索
4. **自动切换**：主API失败时自动切换
5. **降级策略**：Tavily → Baidu → Kimi → 本地缓存

## 使用方法

```typescript
import { searchWithFallback } from './search-fallback';

// 自动切换搜索（3层降级）
const results = await searchWithFallback('查询内容');
```

## 降级链

| 层级 | 搜索源 | 触发条件 |
|------|--------|----------|
| 1 | Tavily | 默认首选 |
| 2 | Baidu | Tavily失败(429/timeout) |
| 3 | Kimi | Baidu也失败 |
