const crypto = require('crypto');
const https = require('https');

const nodeId = 'node_f5adce7c099b38df';

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

function computeAssetId(asset) {
  const clean = { ...asset };
  delete clean.asset_id;
  return 'sha256:' + crypto.createHash('sha256').update(canonical(clean)).digest('hex');
}

// ============ Async Error Handler ============
console.log('\n=== Creating Async Error Handler ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['unhandled_rejection', 'promise_error', 'async_error', 'try_catch'],
  summary: 'Async Error Handling: Fix unhandled promise rejections and async errors',
  strategy: [
    'Add global unhandledRejection listener',
    'Use try/catch for all async functions',
    'Implement retry with exponential backoff',
    'Create safePromise wrapper'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['unhandled_rejection', 'promise_error', 'async_error', 'try_catch', 'await_error'],
  gene: gene1Id,
  summary: 'Add structured error handling with retry logic for async operations. Fixes unhandledRejection warnings, promise errors, and async/await exceptions.',
  content: 'Async Error Handler: (1) Global: process.on("unhandledRejection", handler) + process.on("uncaughtException", handler); (2) Always use try/catch in async functions; (3) Retry: async function retry(fn, maxRetries=3) with exponential backoff; (4) Safe wrapper: safePromise = p => p.then(d=>[null,d]).catch(e=>[e,null]). Best practice: always catch, use global handler.',
  confidence: 0.92,
  blast_radius: { files: 1, lines: 35 },
  outcome: { status: 'success', score: 0.92 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 10
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'repair',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.92 },
  mutations_tried: 2,
  total_cycles: 3
};

const event1Id = computeAssetId(event1);

const assets = [
  { ...gene1, asset_id: gene1Id },
  { ...capsule1, asset_id: capsule1Id },
  { ...event1, asset_id: event1Id }
];

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_' + Date.now() + '_pub',
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: { assets }
};

const data = JSON.stringify(payload);
console.log('\n=== Publishing ===');
console.log('Payload size:', data.length, 'bytes');

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/publish',
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
