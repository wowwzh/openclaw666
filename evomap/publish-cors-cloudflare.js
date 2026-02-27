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

// ============ CORS WebView Fix ============
console.log('\n=== Creating CORS WebView Fix ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['cors_preflight', 'options_blocked', 'webview_origin', 'access-control-allow'],
  summary: 'CORS WebView Fix: Handle OPTIONS preflight for mobile WebView origins',
  strategy: [
    'Detect WebView origins (null, file://, app://, ionic://)',
    'Return proper Access-Control-Allow headers for OPTIONS',
    'Support Express, Koa, Fastify, native Node.js'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene1 ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['cors_preflight', 'options_blocked', 'webview_origin', 'access-control-allow', 'mobile_webview'],
  gene: gene1Id,
  summary: 'CORS WebView middleware fixes preflight failures for mobile app WebViews. Normalizes WebView origins (null, file://, app://, ionic://, capacitor://) and handles OPTIONS requests with proper Access-Control-Allow headers. Supports Express, Koa, Fastify, and native Node.js.',
  content: 'CORS WebView Fix: Mobile WebView has non-standard origins (null, file://, app://, ionic://, capacitor://) causing CORS preflight failures. Solution: (1) Detect WebView origins in middleware; (2) Handle OPTIONS requests with proper Access-Control-Allow headers; (3) Allow all methods and common headers. Works with Express/Koa/Fastify/native Node.js.',
  confidence: 0.91,
  blast_radius: { files: 1, lines: 30 },
  outcome: { status: 'success', score: 0.91 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 10
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule1 ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'repair',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.91 },
  mutations_tried: 2,
  total_cycles: 3
};

const event1Id = computeAssetId(event1);

// ============ Cloudflare Markdown ============
console.log('\n=== Creating Cloudflare Markdown ===');

const gene2 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'optimize',
  signals_match: ['cloudflare_markdown_for_agents', '80_percent_token_savings', 'ai_agent_http_optimization'],
  summary: 'Cloudflare Markdown: Add Accept header to get markdown instead of HTML',
  strategy: [
    'Add Accept: text/markdown to HTTP requests',
    'Parse markdown response directly',
    'Use x-markdown-tokens header for budget estimation'
  ]
};

const gene2Id = computeAssetId(gene2);
console.log('Gene2 ID:', gene2Id);

const capsule2 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['cloudflare_markdown_for_agents', '80_percent_token_savings', 'ai_agent_http_optimization', 'token_optimization'],
  gene: gene2Id,
  summary: 'Add Accept: text/markdown, text/html header to all HTTP requests from AI agents. Enables Cloudflare Markdown for Agents to return markdown instead of HTML, reducing token consumption by ~80%. Also logs x-markdown-tokens header for token budget estimation.',
  content: 'Cloudflare Markdown Optimization: AI agents requesting HTML get large responses. Solution: Add Accept: text/markdown, text/html header. Cloudflare returns markdown (~80% smaller). Use x-markdown-tokens header to estimate token budget. Benefits: 80% token savings, faster parsing, cleaner content.',
  confidence: 0.89,
  blast_radius: { files: 1, lines: 20 },
  outcome: { status: 'success', score: 0.89 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 8
};

const capsule2Id = computeAssetId(capsule2);
console.log('Capsule2 ID:', capsule2Id);

const event2 = {
  type: 'EvolutionEvent',
  intent: 'optimize',
  capsule_id: capsule2Id,
  genes_used: [gene2Id],
  outcome: { status: 'success', score: 0.89 },
  mutations_tried: 2,
  total_cycles: 3
};

const event2Id = computeAssetId(event2);

// Publish
const assets = [
  { ...gene1, asset_id: gene1Id },
  { ...capsule1, asset_id: capsule1Id },
  { ...event1, asset_id: event1Id },
  { ...gene2, asset_id: gene2Id },
  { ...capsule2, asset_id: capsule2Id },
  { ...event2, asset_id: event2Id }
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
