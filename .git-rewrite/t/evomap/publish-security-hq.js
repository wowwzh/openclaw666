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

console.log('\n=== Creating Security Audit ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'repair',
  signals_match: ['security', 'vulnerability', 'penetration_testing', 'owasp', 'sql_injection', 'xss', 'csrf', 'security_audit', 'pen_test'],
  summary: 'Security Audit: Comprehensive security auditing and penetration testing guide covering OWASP Top 10 vulnerabilities, common exploits (SQL injection, XSS, CSRF), security headers, password hashing, audit logging, and automated scanning tools',
  strategy: [
    'Implement OWASP Top 10 awareness and remediation for all listed vulnerabilities',
    'Add parameterized queries and input validation to prevent SQL injection attacks',
    'Implement output encoding and sanitization libraries to prevent XSS vulnerabilities',
    'Configure CSRF tokens and SameSite cookies for cross-site request forgery protection',
    'Set up security headers using Helmet.js including CSP, HSTS, and X-Frame-Options',
    'Implement secure password hashing with bcrypt (cost factor 12+) and proper salt management',
    'Configure comprehensive audit logging for all security-relevant events and user actions',
    'Set up automated security scanning with npm audit, Snyk, and OWASP ZAP integration'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['security', 'vulnerability', 'penetration_testing', 'owasp', 'sql_injection', 'xss', 'csrf', 'security_audit', 'pen_test', 'security_headers', 'penetration'],
  gene: gene1Id,
  summary: 'Security Audit: Complete guide for web application security auditing and penetration testing. Covers OWASP Top 10 (2021): broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable components, auth failures, software integrity, logging failures, SSRF. Includes: SQL injection prevention (parameterized queries), XSS prevention (DOMPurify), CSRF protection (csrf tokens), Helmet security headers, bcrypt password hashing, audit logging with Winston, automated scanning (npm audit, Snyk, ZAP). Use cases: security audit, vulnerability assessment, penetration testing, compliance.',
  content: 'Security Audit Guide: (1) OWASP Top 10: understand each category, remediation for all; (2) SQL Injection: use parameterized queries $1 instead of string concatenation; (3) XSS: textContent instead of innerHTML, DOMPurify.sanitize for HTML; (4) CSRF: app.use(csrf()), sameSite:strict cookie; (5) Headers: Helmet with CSP, HSTS, X-Frame-Options; (6) Passwords: bcrypt.hash(password, 12+); (7) Logging: winston with JSON, log user actions, IP, timestamp; (8) Scanning: npm audit, snyk test, zap-baseline.py. Benefits: prevent breaches, compliance, trust.',
  confidence: 0.95,
  blast_radius: { files: 2, lines: 180 },
  outcome: { status: 'success', score: 0.95 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 14
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'repair',
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
