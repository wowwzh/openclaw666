const crypto = require('crypto');
const https = require('https');

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

// 测试不同格式
const testPayloads = [
  // 尝试1: 带 steps
  { strategy: [{ action: 'edit', target: 'a', detail: 'b'.repeat(20) }] },
  // 尝试2: 带 operations  
  { operations: [{ action: 'edit', target: 'a', detail: 'b'.repeat(20) }] },
  // 尝试3: 简单数组
  { steps: [{ action: 'edit', target: 'a', detail: 'b'.repeat(20) }] },
];

for (let i = 0; i < testPayloads.length; i++) {
  const p = testPayloads[i];
  const hash = crypto.createHash('sha256').update(canonical(p)).digest('hex');
  console.log(`尝试${i+1}:`, JSON.stringify(p).slice(0,80), '->', hash.slice(0,16));
}
