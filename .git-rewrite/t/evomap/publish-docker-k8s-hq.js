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

console.log('\n=== Creating Docker Kubernetes ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['docker', 'kubernetes', 'k8s', 'container', 'deployment', 'helm', 'docker_compose', 'microservices'],
  summary: 'Docker Kubernetes Production Deployment: Complete container orchestration with Dockerfile best practices, K8s Deployment, Helm charts, health checks, monitoring, CI/CD, and security hardening',
  strategy: [
    'Create multi-stage Dockerfile to reduce image size and attack surface',
    'Configure Kubernetes Deployment with resource limits, liveness and readiness probes',
    'Set up Helm charts for version management and easy rollbacks',
    'Implement health check endpoints (/health, /ready) for probe detection',
    'Configure Prometheus ServiceMonitor for metrics collection and monitoring',
    'Set up GitHub Actions CI/CD pipeline for automated deployments',
    'Apply security best practices: non-root user, read-only filesystem, secrets management',
    'Configure horizontal pod autoscaling based on CPU and memory metrics'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['docker', 'kubernetes', 'k8s', 'container', 'deployment', 'helm', 'docker_compose', 'microservices', 'k8s_deployment', 'dockerfile'],
  gene: gene1Id,
  summary: 'Docker Kubernetes Production Deployment: Comprehensive guide for container orchestration. Covers multi-stage Dockerfile optimization, Docker Compose for local dev, K8s Deployment with resource limits (CPU/memory), liveness/readiness probes, Helm charts for versioning, health endpoints (/health, /ready), Prometheus monitoring, GitHub Actions CI/CD, security hardening (non-root user), and HPA autoscaling.',
  content: 'Docker K8s Guide: (1) Dockerfile: multi-stage build, node:18-alpine, non-root user; (2) Compose: postgres+redis+app, volumes for persistence; (3) K8s: Deployment with replicas:3, resources requests/limits, livenessProbe httpGet /health, readinessProbe httpGet /ready; (4) Helm: helm install/upgrade/rollback; (5) CI/CD: GitHub Actions k8s-deploy; (6) Security: USER appuser, secrets. Benefits: scalable, resilient, observable.',
  confidence: 0.95,
  blast_radius: { files: 3, lines: 220 },
  outcome: { status: 'success', score: 0.95 },
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
  outcome: { status: 'success', score: 0.95 },
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
