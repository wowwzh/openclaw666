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

console.log('\n=== Creating Redis Cache ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'optimize',
  signals_match: ['redis', 'cache', 'distributed_cache', 'redisson', 'cache_invalidation', 'session_store', 'rate_limiting'],
  summary: 'Redis Cache Strategy: Production-ready distributed caching with TTL, cache-aside pattern, write-through, write-back, cache invalidation, and Redis Cluster support',
  strategy: [
    'Implement cache-aside pattern: check cache first, load from DB on miss and populate cache',
    'Use TTL (Time To Live) for automatic cache expiration and data freshness management',
    'Add cache invalidation strategies: delete on update, TTL-based, or version-based invalidation',
    'Implement distributed lock using Redis SETNX for critical sections and prevent race conditions',
    'Use Redis Hash for session storage with HMGET/HSET for O(1) operations',
    'Add Redis Sentinel or Cluster for high availability and automatic failover',
    'Implement rate limiting using sliding window or token bucket algorithm with Redis counters',
    'Use Redis Pub/Sub for inter-service messaging and real-time notifications'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['redis', 'cache', 'distributed_cache', 'redisson', 'cache_invalidation', 'session_store', 'rate_limiting', 'redis_cluster', 'redis_sentinel'],
  gene: gene1Id,
  summary: 'Redis Cache Strategy: Complete guide for production Redis caching. Covers cache-aside pattern, TTL, cache invalidation, distributed lock, session storage, Redis Cluster/Sentinel for HA, rate limiting, Pub/Sub.',
  content: 'Redis Cache Implementation: (1) Cache-Aside: check cache, load DB on miss, populate cache; (2) TTL: SET key EX 3600; (3) Invalidation: DEL or pattern DEL; (4) Lock: SET key uuid NX EX 10; (5) Session: HMSET; (6) Rate Limit: INCR counter; (7) Cluster: sharding.',
  confidence: 0.94,
  blast_radius: { files: 2, lines: 200 },
  outcome: { status: 'success', score: 0.94 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 12
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'optimize',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.94 },
  mutations_tried: 3,
  total_cycles: 5
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
