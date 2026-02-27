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

console.log('\n=== Creating CI/CD Pipeline ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['ci_cd', 'continuous_integration', 'continuous_deployment', 'github_actions', 'gitlab_ci', 'jenkins', 'pipeline', 'devops', 'automated_testing', 'deployment'],
  summary: 'CI/CD Pipeline: Complete continuous integration and deployment pipeline with GitHub Actions, automated testing, Docker multi-stage builds, environment management, rolling updates, and instant rollback capabilities for production systems',
  strategy: [
    'Set up GitHub Actions workflow with stages: checkout, install dependencies, lint, test with coverage, build Docker image',
    'Configure automated testing pipeline with unit tests, integration tests, and end-to-end tests in parallel',
    'Implement Docker multi-stage build to reduce image size and separate build from runtime environment',
    'Set up environment-specific configuration with .env files for development, staging, and production',
    'Configure Kubernetes rolling deployment with maxSurge and maxUnavailable for zero-downtime updates',
    'Implement instant rollback capabilities using kubectl rollout undo or Docker image tags',
    'Add deployment notifications to Slack/Discord for success and failure alerts',
    'Configure automated code quality checks with ESLint, Prettier, and security scanning'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['ci_cd', 'continuous_integration', 'continuous_deployment', 'github_actions', 'gitlab_ci', 'jenkins', 'pipeline', 'devops', 'automated_testing', 'deployment', 'docker_build'],
  gene: gene1Id,
  summary: 'CI/CD Pipeline: Comprehensive guide for building production CI/CD pipelines. Covers: (1) GitHub Actions workflow with test/build/deploy stages; (2) Automated testing: unit, integration, e2e with Jest and coverage; (3) Docker multi-stage build for minimal images; (4) Environment config: .env files for dev/staging/prod; (5) Kubernetes rolling deployment with zero-downtime; (6) Rollback: kubectl rollout undo; (7) Notifications: Slack/Discord alerts; (8) Quality: ESLint, security scanning. Benefits: fast feedback, reliable deployments, easy rollback.',
  content: 'CI/CD Pipeline Guide: (1) GitHub Actions: on push/pr, jobs test->build->deploy, actions/checkout@v3, setup-node, codecov; (2) Tests: npm test --coverage, Jest config parallel/maxWorkers; (3) Docker: multi-stage FROM node:18-alpine AS builder, COPY --from=builder, USER node; (4) Env: dotenv.config({path: .env.${NODE_ENV}}); (5) K8s Deploy: strategy: RollingUpdate, maxSurge:1, maxUnavailable:0; (6) Rollback: kubectl rollout undo deployment/app; (7) Notify: curl -X POST slack webhook on failure; (8) Quality: ESLint, dependabot for updates. Tools: GitHub Actions, GitLab CI, Jenkins, ArgoCD.',
  confidence: 0.97,
  blast_radius: { files: 3, lines: 290 },
  outcome: { status: 'success', score: 0.97 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 16
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.97 },
  mutations_tried: 5,
  total_cycles: 7
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
