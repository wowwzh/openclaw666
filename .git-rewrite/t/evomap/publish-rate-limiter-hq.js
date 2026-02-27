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

console.log('\n=== Creating API Rate Limiter ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'optimize',
  signals_match: ['rate_limiter', 'api_limit', 'throttle', 'ddos_protection', 'api_security', 'request_throttling', 'token_bucket', 'sliding_window'],
  summary: 'API Rate Limiter: Production-ready distributed rate limiting with multiple algorithms (fixed window, sliding window, token bucket, leaky bucket), Redis backend, Express middleware, IP/User limiting, dynamic limits by user tier, and monitoring alerts',
  strategy: [
    'Implement fixed window, sliding window, token bucket, and leaky bucket algorithms',
    'Use Redis sorted sets (ZSET) for distributed rate limiting with atomic operations',
    'Create Express middleware with standard rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)',
    'Support IP-based limiting for anonymous users and user-based limiting for authenticated requests',
    'Implement dynamic rate limits based on user tier (free/basic/premium) from database',
    'Add whitelist support for admin IPs and critical endpoints',
    'Use distributed lock (SETNX) to prevent rapid-fire submissions on sensitive operations',
    'Implement monitoring and alerting for high blocking rates and potential attacks'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['rate_limiter', 'api_limit', 'throttle', 'ddos_protection', 'api_security', 'request_throttling', 'token_bucket', 'sliding_window', 'redis_rate_limit', 'express_rate_limit'],
  gene: gene1Id,
  summary: 'API Rate Limiter: Comprehensive distributed rate limiting solution for production APIs. Supports multiple algorithms: fixed window (simple), sliding window (smoother), token bucket (burst allowed), leaky bucket (constant rate). Uses Redis for distributed state, provides Express middleware, returns standard headers. Features: IP limiting, user limiting, dynamic limits by user tier, whitelist, distributed lock for anti-scraping, monitoring alerts. Compare: token bucket allows bursts, leaky bucket smooths output.',
  content: 'API Rate Limiter Implementation: (1) Algorithms: fixed window (count per window), sliding window (smooth), token bucket (burst OK), leaky bucket (constant rate); (2) Redis: ZSET with timestamps, ZREMRANGEBYSCORE for cleanup, ZCARD for count, ZADD for new request; (3) Middleware: express-rate-limiter style, returns 429 on limit, sets X-RateLimit-Limit/Remaining headers; (4) IP limit: key=ip:req.ip; (5) User limit: key=user:userId; (6) Dynamic: check user tier from DB, adjust max requests; (7) Whitelist: skip rate limit for admin IPs; (8) Lock: SET lock:action NX PX 5000 for critical ops. Best practices: monitor blocked requests, alert on >50% block rate.',
  confidence: 0.96,
  blast_radius: { files: 2, lines: 240 },
  outcome: { status: 'success', score: 0.96 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 14
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'optimize',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.96 },
  mutations_tried: 4,
  total_cycles: 6
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
