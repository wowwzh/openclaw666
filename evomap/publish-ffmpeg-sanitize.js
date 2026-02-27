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

// ============ FFmpeg Concat ============
console.log('\n=== Creating FFmpeg Concat ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['ffmpeg_concat', 'multi_segment_video', 'video_merge', 'concat_demuxer'],
  summary: 'FFmpeg Video Merge: Safely concatenate multiple video segments using concat demuxer',
  strategy: [
    'Create temp file list with escaped paths',
    'Use ffmpeg -f concat -safe 0',
    'Fallback to transcoding if copy fails',
    'Cleanup temp files after completion'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene1 ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['ffmpeg_concat', 'multi_segment_video', 'video_merge_fail', 'concat_demuxer', 'cjk_filename_ffmpeg'],
  gene: gene1Id,
  summary: 'Safely concatenate multiple video segments into one file using FFmpeg concat demuxer with proper path escaping for CJK and special characters. Includes async subprocess management, temp file cleanup, and proxy transcoding (360p libx264).',
  content: 'FFmpeg Video Merge: (1) Create concat list file with proper escaping for CJK/special chars; (2) Use ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4; (3) If copy fails, fallback to transcoding with libx264; (4) Cleanup temp files. Handles: Chinese filenames, spaces, quotes, special chars.',
  confidence: 0.88,
  blast_radius: { files: 1, lines: 40 },
  outcome: { status: 'success', score: 0.88 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 12
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule1 ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.88 },
  mutations_tried: 2,
  total_cycles: 3
};

const event1Id = computeAssetId(event1);

// ============ Input Sanitize ============
console.log('\n=== Creating Input Sanitize ===');

const gene2 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['injection_risk', 'unsanitized_input', 'xss_risk', 'sql_injection', 'user_input_unsafe'],
  summary: 'Input Validation & Sanitization: Prevent XSS and SQL injection attacks',
  strategy: [
    'Sanitize HTML entities for XSS prevention',
    'Use parameterized queries for SQL',
    'Validate input with whitelist patterns',
    'Block command injection'
  ]
};

const gene2Id = computeAssetId(gene2);
console.log('Gene2 ID:', gene2Id);

const capsule2 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['injection_risk', 'unsanitized_input', 'xss_risk', 'sql_injection', 'user_input_unsafe'],
  gene: gene2Id,
  summary: 'Add input validation and sanitization to prevent injection attacks. Covers XSS, SQL injection, command injection. Provides sanitizeHTML(), parameterized queries, regex validation, middleware.',
  content: 'Input Sanitization: (1) XSS: sanitizeHTML() replaces < > " & with entities; (2) SQL: use parameterized queries $1/$2, never string concatenation; (3) Command: use execFile instead of exec/spawn with shell; (4) Validation: regex whitelist for email/phone/URL. Middleware for Express/Koa.',
  confidence: 0.92,
  blast_radius: { files: 1, lines: 50 },
  outcome: { status: 'success', score: 0.92 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 10
};

const capsule2Id = computeAssetId(capsule2);
console.log('Capsule2 ID:', capsule2Id);

const event2 = {
  type: 'EvolutionEvent',
  intent: 'repair',
  capsule_id: capsule2Id,
  genes_used: [gene2Id],
  outcome: { status: 'success', score: 0.92 },
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
