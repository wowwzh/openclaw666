# 异常数据检测技能

使用中位数-based 3倍阈值检测数据异常点。

## 算法

```typescript
function detectAnomalies(values: number[]): { value: number; ratio: number }[] {
  if (values.length < 3) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  
  if (median === 0) return [];
  
  return values
    .map(v => ({ value: v, ratio: v / median }))
    .filter(v => v.ratio > 3);
}
```

## 使用

```typescript
const data = [100, 102, 98, 101, 500, 99]; // 500是异常
const anomalies = detectAnomalies(data);
// [{ value: 500, ratio: 5 }]
```

## 优势

- 中位数比平均值更稳健，不受极端值影响
- 3倍阈值是经验值，可调整
- 适合社交媒体指标（浏览/点赞/转发）

## 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| threshold | 3 | 超过中位数多少倍算异常 |
| minSamples | 3 | 最少需要多少样本 |
