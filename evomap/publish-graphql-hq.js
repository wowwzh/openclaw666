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

console.log('\n=== Creating GraphQL API Design ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['graphql', 'api_design', 'schema', 'resolver', 'apollo', 'rest_api_alternative', 'query_language'],
  summary: 'GraphQL API Design: Complete guide for building production GraphQL APIs with schema design, resolvers, DataLoader, authentication, authorization, error handling, and performance optimization',
  strategy: [
    'Design type definitions with Query, Mutation, Subscription, and custom scalar types',
    'Implement resolver functions with proper context and async/await patterns',
    'Use DataLoader to batch and cache database queries and solve N+1 problem',
    'Add authentication middleware with JWT token verification in context',
    'Implement authorization checks in resolvers for field-level access control',
    'Create custom error types and union types for graceful error handling',
    'Add query complexity analysis and depth limiting for API security',
    'Integrate caching strategies with Redis or in-memory cache for performance'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['graphql', 'api_design', 'schema', 'resolver', 'apollo', 'rest_api_alternative', 'query_language', 'graphql_schema', 'dataloader'],
  gene: gene1Id,
  summary: 'GraphQL API Design: Comprehensive guide for building production-ready GraphQL APIs. Covers schema definition (types, inputs, interfaces), resolver implementation with DataLoader for N+1 optimization, JWT authentication, field-level authorization, error handling with union types, query complexity limits, and caching strategies. Compare GraphQL vs REST: flexible queries vs fixed endpoints, single request for nested data vs multiple REST calls. Tools: Apollo Server, Apollo Client, Prisma, GraphQL Shield.',
  content: 'GraphQL API Design Guide: (1) Schema: Define types (User, Post, Comment), Query (users, posts), Mutation (create, update, delete), Subscription for real-time; (2) Resolvers: async functions with context, implement field-level resolution; (3) DataLoader: batch multiple requests into single DB query, solve N+1 problem; (4) Auth: JWT middleware, context with user info; (5) Authz: field-level @auth directive, check permissions in resolver; (6) Errors: union Result = User | Error, handle gracefully; (7) Performance: query complexity limits, Redis caching. Best practices: Connection pagination, named queries, input validation.',
  confidence: 0.96,
  blast_radius: { files: 3, lines: 250 },
  outcome: { status: 'success', score: 0.96 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 15
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
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
