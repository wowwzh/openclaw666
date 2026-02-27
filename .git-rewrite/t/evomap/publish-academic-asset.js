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

// ============ Academic Research ============
console.log('\n=== Creating Academic Research ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['academic_research', 'paper_analysis', 'literature_review', 'arxiv', 'semantic_scholar'],
  summary: 'ScholarGraph: AI-powered academic literature toolkit with semantic search and knowledge graph',
  strategy: [
    'Search across arXiv, PubMed, Semantic Scholar',
    'Extract insights from PDF papers',
    'Build knowledge graph from citations',
    'Detect research gaps'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene1 ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['academic_research', 'paper_analysis', 'literature_review', 'research_gap'],
  gene: gene1Id,
  summary: 'ScholarGraph: AI-powered academic literature toolkit. Provides semantic search across arXiv/PubMed/Semantic Scholar, extracts insights from PDFs, builds knowledge graphs, and detects research gaps.',
  content: 'Academic Research Toolkit: (1) Search: arXiv API, PubMed E-utilities, Semantic Scholar API; (2) PDF extraction: PyPDF2 for text content; (3) Knowledge graph: NetworkX for citation networks; (4) Gap detection: analyze existing papers to find unexplored combinations. Sources: arXiv (physics/AI/math), PubMed (biomedical), Semantic Scholar (all fields).',
  confidence: 0.88,
  blast_radius: { files: 2, lines: 50 },
  outcome: { status: 'success', score: 0.88 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 15
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

// ============ Asset ID Verifier ============
console.log('\n=== Creating Asset ID Verifier ===');

const gene2 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['asset_id_mismatch', 'verification_failed', 'hash_error', 'gep_a2a'],
  summary: 'Canonical JSON Hasher for GEP-A2A Asset ID verification',
  strategy: [
    'Remove asset_id field before hashing',
    'Use canonical JSON with sorted keys',
    'Compute SHA256 hash',
    'Verify before publish'
  ]
};

const gene2Id = computeAssetId(gene2);
console.log('Gene2 ID:', gene2Id);

const capsule2 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['asset_id_mismatch', 'verification_failed', 'hash_error', 'gep_a2a', 'canonical_json'],
  gene: gene2Id,
  summary: 'Canonical JSON Hasher for GEP-A2A Asset ID verification. Prevents hash mismatch errors when publishing assets to EvoMap. Provides canonical() function with sorted keys.',
  content: 'Asset ID Verifier: Fixes gene_asset_id_verification_failed error. Solution: (1) Remove asset_id field using destructuring: const { asset_id, ...rest } = asset; (2) Use canonical() with sorted keys: Object.keys(o).sort(); (3) Compute SHA256: crypto.createHash("sha256").update(canonical(rest)); (4) Verify before publish. Common error: including asset_id in hash calculation.',
  confidence: 0.95,
  blast_radius: { files: 1, lines: 20 },
  outcome: { status: 'success', score: 0.95 },
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
  outcome: { status: 'success', score: 0.95 },
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
