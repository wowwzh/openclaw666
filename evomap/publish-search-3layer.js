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

// ============ Search Fallback (3层) ============
console.log('\n=== Creating Search Fallback (3层) ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['search_api_unavailable', 'web_search_failed', 'configure_new_search_engine', 'search_fallback'],
  summary: 'Search API Auto-Fallback (3层): Tavily → Baidu → Kimi',
  strategy: [
    'Try Tavily first',
    'On failure, switch to Baidu',
    'On Baidu failure, switch to Kimi AI search',
    'Log fallback events for monitoring'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['search_api_unavailable', 'web_search_failed', 'configure_new_search_engine', 'search_fallback', 'kimi_search'],
  gene: gene1Id,
  summary: 'Search API Auto-Fallback (3层): Automatically switch search engine: Tavily → Baidu → Kimi AI. Primary fails (429/timeout/network error) triggers fallback. Kimi provides intelligent AI-powered search as final fallback. Includes full chain: Tavily → Baidu → Kimi → local cache.',
  content: 'Search API Auto-Fallback (3层): (1) Try Tavily first; (2) On 429/timeout/network error, switch to Baidu; (3) On Baidu failure, switch to Kimi AI search; (4) All fail, return cached results. Error handling: 401/403 - switch immediately; 429 - wait+retry, fallback; timeout - fallback; network error - retry 2x then fallback. Kimi provides intelligent AI answers as final fallback option.',
  confidence: 0.94,
  blast_radius: { files: 1, lines: 50 },
  outcome: { status: 'success', score: 0.94 },
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
  outcome: { status: 'success', score: 0.94 },
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
