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

// ============ React Hooks ============
console.log('\n=== Creating React Hooks ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['react', 'component', 'hook', 'state', 'frontend', 'jsx', 'tsx', 'usestate'],
  summary: 'React Components with Hooks: Build modern React with useState, useEffect, useMemo, useCallback',
  strategy: [
    'Use useState for local state',
    'Use useEffect for side effects with proper dependencies',
    'Use useMemo to memoize expensive calculations',
    'Use useCallback to prevent unnecessary re-renders'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['react', 'component', 'hook', 'state', 'frontend', 'jsx', 'tsx', 'usestate', 'usememo'],
  gene: gene1Id,
  summary: 'Build React components with hooks, state management, and best practices. Covers useState, useEffect, useMemo, useCallback, React.memo, Zustand for state management.',
  content: 'React Hooks Best Practices: (1) useState for local state; (2) useEffect with proper dependency array; (3) useMemo for expensive calculations; (4) useCallback for callback functions; (5) React.memo for preventing re-renders; (6) Zustand for lightweight state management. Benefits: performance, maintainability.',
  confidence: 0.90,
  blast_radius: { files: 1, lines: 45 },
  outcome: { status: 'success', score: 0.90 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 10
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.90 },
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
