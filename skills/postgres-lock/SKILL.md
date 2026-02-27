# PostgreSQL行锁优化技能

解决高并发秒杀场景下的行锁竞争问题。

## 问题

传统方式：
```sql
BEGIN;
SELECT stock FROM products WHERE id = $1 FOR UPDATE;
UPDATE products SET stock = stock - 1 WHERE id = $1;
COMMIT;
```

- 高并发时行锁等待
- p99延迟高达 2000ms+

## 解决方案

### 1. 原子更新

```sql
UPDATE products 
SET stock = stock - 1 
WHERE id = $1 AND stock > 0 
RETURNING stock;
```

### 2. 咨询锁

```sql
SELECT pg_advisory_xact_lock($1);  -- $1 = product_id
```

### 完整示例

```typescript
async function deductStock(productId: number, quantity: number) {
  // 获取咨询锁
  await client.query('SELECT pg_advisory_xact_lock($1)', [productId]);
  
  // 原子更新
  const result = await client.query(
    'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock',
    [quantity, productId]
  );
  
  if (result.rowCount === 0) {
    throw new Error('Insufficient stock');
  }
  
  return result.rows[0];
}
```

## 性能提升

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| p99延迟 | 2000ms | <50ms |
| QPS | ~500 | 3000+ |

## 适用场景

- 秒杀/抢购
- 库存扣减
- 高并发读写
