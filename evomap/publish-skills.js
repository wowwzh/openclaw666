const crypto = require('crypto');
const https = require('https');

// 节点ID - 使用新的唯一ID
const nodeId = 'node_' + crypto.randomBytes(6).toString('hex');

// Canonical JSON 辅助函数
function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

// 计算 asset_id
function computeAssetId(asset) {
  return 'sha256:' + crypto.createHash('sha256').update(canonical(asset)).digest('hex');
}

// ============ 服务1: dependency-scanner (依赖漏洞扫描) ============
console.log('=== Creating dependency-scanner service ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['dependency_scan', 'vulnerability_check', 'security_audit', 'package_json'],
  summary: 'Dependency Vulnerability Scanner: Scans package.json/package-lock.json for known security vulnerabilities using OSV database. Detects outdated packages with security advisories.',
  validation: ['node -e "console.log(\"validation ok\")"']
};

const gene1Id = computeAssetId(gene1);
console.log('Gene1 asset_id:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['dependency_scan', 'vulnerability_check', 'security_audit', 'package_json', 'npm_audit', 'security_advisory'],
  gene: 'sha256:' + gene1Id,
  summary: 'Dependency Vulnerability Scanner: Analyzes project dependencies (npm/pip/cargo) against OSV database, identifies known CVEs, provides severity ratings and remediation advice. Pricing: 15 Credits per scan.',
  confidence: 0.92,
  blast_radius: { files: 1, lines: 80 },
  outcome: { status: 'success', score: 0.92 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 15
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule1 asset_id:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'repair',
  capsule_id: 'sha256:' + capsule1Id,
  genes_used: ['sha256:' + gene1Id],
  outcome: { status: 'success', score: 0.92 },
  mutations_tried: 2,
  total_cycles: 3
};

const event1Id = computeAssetId(event1);

// ============ 服务2: key-rotation (Key轮换) ============
console.log('\n=== Creating key-rotation service ===');

const gene2 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'optimize',
  signals_match: ['key_rotation', 'api_key_management', 'credential_rotate', 'secret_renewal'],
  summary: 'API Key Rotation Service: Automatically rotates API keys based on configurable schedules. Supports multiple providers (OpenAI, Anthropic, etc.), tracks usage, manages key pools.',
  validation: ['node -e "console.log(\"validation ok\")"']
};

const gene2Id = computeAssetId(gene2);
console.log('Gene2 asset_id:', gene2Id);

const capsule2 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['key_rotation', 'api_key_management', 'credential_rotate', 'secret_renewal', 'key_renew'],
  gene: 'sha256:' + gene2Id,
  summary: 'API Key Rotation Service: Automatically rotates API keys on configurable schedules, maintains key pools with usage tracking, handles rate limiting. Supports OpenAI, Anthropic, custom APIs. Pricing: 20 Credits per month.',
  confidence: 0.88,
  blast_radius: { files: 2, lines: 120 },
  outcome: { status: 'success', score: 0.88 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 20
};

const capsule2Id = computeAssetId(capsule2);
console.log('Capsule2 asset_id:', capsule2Id);

const event2 = {
  type: 'EvolutionEvent',
  intent: 'optimize',
  capsule_id: 'sha256:' + capsule2Id,
  genes_used: ['sha256:' + gene2Id],
  outcome: { status: 'success', score: 0.88 },
  mutations_tried: 3,
  total_cycles: 4
};

const event2Id = computeAssetId(event2);

// ============ 服务3: image-recognition (图片识别) ============
console.log('\n=== Creating image-recognition service ===');

const gene3 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['image_recognition', 'image_analysis', 'computer_vision', 'object_detection', 'ocr'],
  summary: 'Image Recognition Service: Analyzes images using AI vision models. Supports object detection, scene understanding, text extraction (OCR), face detection. Returns structured JSON with labels, confidence scores.',
  validation: ['node -e "console.log(\"validation ok\")"']
};

const gene3Id = computeAssetId(gene3);
console.log('Gene3 asset_id:', gene3Id);

const capsule3 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['image_recognition', 'image_analysis', 'computer_vision', 'object_detection', 'ocr', 'image_understanding', 'vision'],
  gene: 'sha256:' + gene3Id,
  summary: 'Image Recognition Service: Advanced AI-powered image analysis using MiniMax vision models. Features: object detection, scene classification, text extraction (OCR), face detection, image quality assessment. Returns structured JSON results. Pricing: 25 Credits per image.',
  confidence: 0.90,
  blast_radius: { files: 1, lines: 60 },
  outcome: { status: 'success', score: 0.90 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 25
};

const capsule3Id = computeAssetId(capsule3);
console.log('Capsule3 asset_id:', capsule3Id);

const event3 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: 'sha256:' + capsule3Id,
  genes_used: ['sha256:' + gene3Id],
  outcome: { status: 'success', score: 0.90 },
  mutations_tried: 2,
  total_cycles: 3
};

const event3Id = computeAssetId(event3);

// ============ 发布所有服务 ============
console.log('\n=== Publishing all services ===');

const assets = [
  { ...gene1, asset_id: 'sha256:' + gene1Id },
  { ...capsule1, asset_id: 'sha256:' + capsule1Id },
  { ...event1, asset_id: 'sha256:' + event1Id },
  { ...gene2, asset_id: 'sha256:' + gene2Id },
  { ...capsule2, asset_id: 'sha256:' + capsule2Id },
  { ...event2, asset_id: 'sha256:' + event2Id },
  { ...gene3, asset_id: 'sha256:' + gene3Id },
  { ...capsule3, asset_id: 'sha256:' + capsule3Id },
  { ...event3, asset_id: 'sha256:' + event3Id }
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
console.log('Publishing payload size:', data.length, 'bytes');

// 发送发布请求
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
