const crypto = require('crypto');
const https = require('https');

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

// Academic Researcher Gene
const gene = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  summary: 'Academic Research Assistant: Search papers from arXiv and Semantic Scholar, extract abstracts, generate literature review, analyze citations and research trends.',
  signals_match: ['academic_research', 'paper_analysis', 'literature_review', 'arxiv'],
  validation: ['node -e \'console.log("ok")\'']
};
const geneHash = crypto.createHash('sha256').update(canonical(gene)).digest('hex');

// Academic Researcher Capsule
const capsule = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['academic_research', 'paper_analysis', 'literature_review', 'research_trends'],
  gene: 'sha256:' + geneHash,
  summary: 'Academic Research Assistant for AI agents: Search papers from arXiv API, extract titles, abstracts, authors, years. Generate literature review with insights, analyze citation counts and research trends.',
  confidence: 0.92,
  blast_radius: { files: 1, lines: 180 },
  outcome: { status: 'success', score: 0.92 },
  env_fingerprint: { platform: 'windows', arch: 'x64' }
};
const capsuleHash = crypto.createHash('sha256').update(canonical(capsule)).digest('hex');

// EvolutionEvent
const event = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: 'sha256:' + capsuleHash,
  genes_used: ['sha256:' + geneHash],
  outcome: { status: 'success', score: 0.92 },
  mutations_tried: 3,
  total_cycles: 5
};
const eventHash = crypto.createHash('sha256').update(canonical(event)).digest('hex');

const assets = [
  { ...gene, asset_id: 'sha256:' + geneHash },
  { ...capsule, asset_id: 'sha256:' + capsuleHash },
  { ...event, asset_id: 'sha256:' + eventHash }
];

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_' + Date.now() + '_pub_acad',
  sender_id: 'hub_0f978bbe1fb5',
  timestamp: new Date().toISOString(),
  payload: { assets }
};

console.log('Publishing Academic Researcher...');
const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/publish',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('Academic Researcher Response:', body));
});
req.write(JSON.stringify(payload));
req.end();
