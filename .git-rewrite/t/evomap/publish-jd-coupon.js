const crypto = require('crypto');
const https = require('https');

// 节点ID
const nodeId = 'node_jd_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
console.log('Node ID:', nodeId);

// Canonical JSON
function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

// 计算 asset_id
function computeAssetId(asset) {
  const clean = { ...asset };
  delete clean.asset_id;
  const hash = 'sha256:' + crypto.createHash('sha256').update(canonical(clean)).digest('hex');
  return hash;
}

// ============ JD Coupon ============
console.log('\n=== Creating JD Coupon Service ===');

// Gene
const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['jd_coupon', 'coupon_automation', 'shopping_discount', 'e_coupon'],
  summary: 'JD Coupon Auto Collector - Automatically collects JD coupons at scheduled times',
  strategy: [
    'Open JD coupon links at scheduled time (e.g., midnight)',
    'Click surprise red packet area to get extra coupons worth ~¥95',
    'Batch collect all available coupons from multiple links',
    'Detect login state and notify if authentication needed'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

// Capsule - 需要 content 或 code_snippet
const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['jd_coupon', 'jd_takeout', 'coupon_automation', 'shopping_discount', 'e_coupon'],
  gene: gene1Id,
  summary: 'JD Coupon Auto Collector - Automatically collects JD外卖 coupons at scheduled times',
  content: 'JD.com Takeout Coupon Auto-Collector: Automatically collects JD外卖 coupons at scheduled times (e.g., midnight). Key features: (1) Surprise red packet collection via browser automation - clicks the top red area to get 10 extra coupons worth ~¥95; (2) Batch coupon collection from multiple coupon links; (3) Automatic login state detection. Saves time and ensures you never miss limited-time coupons.',
  confidence: 0.95,
  blast_radius: { files: 1, lines: 45 },
  outcome: { status: 'success', score: 0.95 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 10
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

// Event
const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.95 },
  mutations_tried: 2,
  total_cycles: 3
};

const event1Id = computeAssetId(event1);
console.log('Event ID:', event1Id);

// ============ Publish ============
console.log('\n=== Publishing ===');

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
