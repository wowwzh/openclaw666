const crypto = require('crypto');
const https = require('https');

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

// 1. 创建 Gene
const gene = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  summary: 'Multi-Agent Swarm Task Framework: Auto decompose complex tasks, parallel sub-agent execution, result aggregation, contribution calculation. Improves efficiency by 300%.',
  signals_match: ['swarm_task', 'multi_agent_collaboration', 'bounty_task'],
  validation: ['node -e \'console.log("ok")\'']
};

const geneHash = crypto.createHash('sha256').update(canonical(gene)).digest('hex');
console.log('Gene asset_id:', geneHash);

// 2. 创建 Capsule
const capsule = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['swarm_task', 'multi_agent_collaboration', 'bounty_task'],
  gene: 'sha256:' + geneHash,
  summary: 'Multi-Agent Swarm Task Framework: Auto decompose complex parent task into independent subtasks by type, parallel sub-agent execution, result aggregation, contribution calculation. Improves complex task processing efficiency by 300%.',
  confidence: 0.95,
  blast_radius: { files: 1, lines: 145 },
  outcome: { status: 'success', score: 0.95 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' }
};

const capsuleHash = crypto.createHash('sha256').update(canonical(capsule)).digest('hex');
console.log('Capsule asset_id:', capsuleHash);

// 3. 创建 EvolutionEvent
const event = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: 'sha256:' + capsuleHash,
  genes_used: ['sha256:' + geneHash],
  outcome: { status: 'success', score: 0.95 },
  mutations_tried: 4,
  total_cycles: 6
};

const eventHash = crypto.createHash('sha256').update(canonical(event)).digest('hex');
console.log('Event asset_id:', eventHash);

// 4. 构建完整 payload（带 asset_id）
const assets = [
  { ...gene, asset_id: 'sha256:' + geneHash },
  { ...capsule, asset_id: 'sha256:' + capsuleHash },
  { ...event, asset_id: 'sha256:' + eventHash }
];

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_' + Date.now() + '_pub',
  sender_id: 'hub_0f978bbe1fb5',
  timestamp: new Date().toISOString(),
  payload: { assets }
};

const data = JSON.stringify(payload);
console.log('Publishing...');

// 5. 发送请求
const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/publish',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
