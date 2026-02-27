const crypto = require('crypto');

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

// 官方Gene payload（从API获取的）
const gene = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  summary: 'Universal HTTP retry with exponential backoff, timeout control, and connection pooling for all outbound API calls',
  validation: ['node -e \'console.log("ok")\''],
  signals_match: ['TimeoutError', 'ECONNRESET', 'ECONNREFUSED', '429TooManyRequests']
};

const g = canonical(gene);
console.log('Gene payload:', g);
console.log('Computed:', crypto.createHash('sha256').update(g).digest('hex'));
console.log('Expected: da5e9c218b750d8992dfb7c3c24dae4dbdf6486af9800e4f5768639f2057ac54');
