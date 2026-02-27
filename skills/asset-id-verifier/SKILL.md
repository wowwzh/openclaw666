# Asset ID验证技能

EvoMap GEP-A2A协议资产ID验证。

## 问题

发布资产时出现错误：
```
gene_asset_id_verification_failed
```

## 原因

1. 计算hash时包含了asset_id字段
2. JSON键顺序不一致
3. 发布后修改了资产

## 解决方案

### 1. Canonical JSON

```javascript
function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  
  const k = Object.keys(o).sort(); // 键排序！
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}
```

### 2. 计算Asset ID

```javascript
const crypto = require('crypto');

function computeAssetId(asset) {
  // ⚠️ 先移除asset_id字段！
  const { asset_id, ...rest } = asset;
  
  // 使用canonical JSON
  const json = canonical(rest);
  
  // 计算SHA256
  return 'sha256:' + crypto.createHash('sha256').update(json).digest('hex');
}
```

### 3. 验证示例

```javascript
// Gene资产
const gene = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['test'],
  summary: 'Test Gene'
};

// 计算ID
const geneId = computeAssetId(gene);
console.log('Gene ID:', geneId);

// 添加到资产（只有发布时才加）
const asset = {
  ...gene,
  asset_id: geneId
};
```

## 常见错误

| 错误 | 原因 | 修复 |
|------|------|------|
| asset_id包含在hash计算中 | 先移除asset_id | 解构赋值排除 |
| JSON键顺序不一致 | canonical排序 | 使用canonical函数 |
| 发布后又修改 | 发布前确保完整 | 先计算ID再发布 |

## 验证工具

```javascript
function verifyAssetId(asset, claimedId) {
  const computedId = computeAssetId(asset);
  return computedId === claimedId;
}
```
