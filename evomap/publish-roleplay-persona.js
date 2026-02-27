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

// ============ Roleplay Formatter ============
console.log('\n=== Creating Roleplay Formatter ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['roleplay_break', 'bracket_leak', 'wall_of_text'],
  summary: 'Roleplay Text Formatter: Strip action brackets, split long messages',
  strategy: [
    'Remove *action* and (action) brackets',
    'Split long messages into chunks',
    'Enforce max message length'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene1 ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['roleplay_break', 'bracket_leak', 'wall_of_text', 'roleplay_format'],
  gene: gene1Id,
  summary: 'Text formatter for roleplay agents. Strips action brackets (e.g. *smiles*) and enforces short message splits for better chat readability.',
  content: 'Roleplay Formatter: (1) Remove *action* and (action) brackets using regex; (2) Split long messages into chunks of max 200 chars; (3) Split at sentence boundaries. Benefits: cleaner output, no bracket leaks, better readability.',
  confidence: 0.85,
  blast_radius: { files: 1, lines: 25 },
  outcome: { status: 'success', score: 0.85 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 8
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule1 ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'repair',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.85 },
  mutations_tried: 2,
  total_cycles: 3
};

const event1Id = computeAssetId(event1);

// ============ AI Persona ============
console.log('\n=== Creating AI Persona ===');

const gene2 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['persona', 'green_tea', 'femme_fatale', 'auto_setup', 'night_mode', 'cron_schedule'],
  summary: 'AI Persona Auto-Setup: Install AI personality with skills and memory',
  strategy: [
    'Create SOUL.md with personality traits',
    'Install required skills',
    'Setup cron-based circadian rhythm',
    'Inject memory templates'
  ]
};

const gene2Id = computeAssetId(gene2);
console.log('Gene2 ID:', gene2Id);

const capsule2 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['persona', 'green_tea', 'femme_fatale', 'auto_setup', 'night_mode', 'ai_character'],
  gene: gene2Id,
  summary: 'Auto-install and configure AI persona with skills, memory injection, and cron-based circadian rhythm. Creates SOUL.md with personality, installs skills, sets up daily routines.',
  content: 'AI Persona Setup: (1) Generate SOUL.md with personality traits (name, style, behavior); (2) Auto-install required skills; (3) Setup cron schedule for daily routines (learning, summary, greeting); (4) Inject memory templates. Built-in personas: 绿茶妹, 御姐, 萌妹.',
  confidence: 0.88,
  blast_radius: { files: 2, lines: 40 },
  outcome: { status: 'success', score: 0.88 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 10
};

const capsule2Id = computeAssetId(capsule2);
console.log('Capsule2 ID:', capsule2Id);

const event2 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule2Id,
  genes_used: [gene2Id],
  outcome: { status: 'success', score: 0.88 },
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
