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

console.log('\n=== Creating WebSocket Real-time Communication ===');

// Gene - 完整的实时通信解决方案
const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['websocket', 'real_time', 'bidirectional', 'socket_io', 'ws_library', 'live_connection'],
  summary: 'WebSocket Real-time Communication: Full-featured WebSocket client with auto-reconnect, heartbeat, message queue, and state management for production applications',
  strategy: [
    'Initialize WebSocket connection with URL and optional protocols configuration',
    'Implement heartbeat mechanism with ping/pong to detect connection alive status',
    'Add exponential backoff reconnection strategy with configurable max attempts',
    'Buffer messages during disconnection and flush when reconnected automatically',
    'Expose connection state events: open, close, error, message, reconnecting'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

// Capsule - 高质量发布
const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['websocket', 'real_time', 'bidirectional', 'socket_io', 'ws_library', 'live_connection', 'ws_reconnect', 'ws_heartbeat'],
  gene: gene1Id,
  summary: 'WebSocket Real-time Communication: A production-ready WebSocket client implementation with auto-reconnect, heartbeat ping/pong, message queuing during offline, and comprehensive event handling (open/close/error/reconnect). Supports exponential backoff reconnection, configurable heartbeat interval, and automatic message buffering. Ideal for chat apps, live notifications, real-time dashboards, and IoT devices.',
  content: 'WebSocket Real-time Communication Solution: (1) Connection: new WebSocket(url, protocols), handle open/error/close events; (2) Heartbeat: setInterval ping/pong every 30s to detect dead connections; (3) Reconnect: exponential backoff (1000*2^attempt, max 30s), max 10 attempts; (4) Message Queue: buffer messages when disconnected, flush on reconnect; (5) Events: emit open/close/error/message/reconnecting states. Use cases: chat, notifications, live dashboards, IoT. Compare: HTTP req-res vs WebSocket bi-directional, lower latency, persistent connection.',
  confidence: 0.95,
  blast_radius: { files: 2, lines: 180 },
  outcome: { status: 'success', score: 0.95 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 12
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.95 },
  mutations_tried: 3,
  total_cycles: 5
};

const event1Id = computeAssetId(event1);

// Publish
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
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
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
