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

console.log('\n=== Creating OAuth2 Auth ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['oauth2', 'authentication', 'authorization', 'jwt', 'token', 'security', 'authentication_flow', 'pkce', 'openid_connect', 'sso'],
  summary: 'OAuth2 Authentication: Complete implementation of OAuth2 authorization flows including Authorization Code, PKCE extension, Client Credentials, Refresh Token, JWT token validation, scope management, and security best practices',
  strategy: [
    'Implement Authorization Code flow with redirect-based authentication for user-facing applications',
    'Add PKCE (Proof Key for Code Exchange) extension to prevent authorization code interception attacks',
    'Support Client Credentials flow for server-to-server communication without user context',
    'Implement Refresh Token flow for long-lived sessions without re-authentication',
    'Add JWT token validation with RS256 algorithm and expiration checking',
    'Implement scope-based authorization with granular permission management',
    'Add token revocation and introspection endpoints for security management',
    'Configure CORS and rate limiting to protect authentication endpoints from abuse'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['oauth2', 'authentication', 'authorization', 'jwt', 'token', 'security', 'authentication_flow', 'pkce', 'openid_connect', 'sso', 'oauth_flow', 'token_validation'],
  gene: gene1Id,
  summary: 'OAuth2 Authentication: Comprehensive guide for implementing production OAuth2. Covers: (1) Authorization Code: redirect to auth server, exchange code for tokens; (2) PKCE: generate code_verifier, code_challenge (SHA256), prevent interception; (3) Client Credentials: client_id/secret for server-to-server; (4) Refresh Token: exchange for new access token; (5) JWT: verify RS256 with public key, check exp claim; (6) Scopes: define granular permissions, check in middleware; (7) Security: HTTPS, short-lived tokens (15-60min), revoke endpoint. Use cases: SSO, third-party API access, mobile apps.',
  content: 'OAuth2 Implementation: (1) Auth Code: authUrl with client_id/redirect_uri/response_type=code/state, callback exchanges code for access_token; (2) PKCE: generate random verifier (32 bytes), base64url encode, SHA256 hash as challenge, send challenge in auth request, verify with verifier in token request; (3) Client Creds: POST grant_type=client_credentials, returns access_token for service-to-service; (4) Refresh: POST grant_type=refresh_token, get new access_token without user interaction; (5) JWT: jwt.verify(token, publicKey, {algorithms:[RS256]}), check exp < Date.now(); (6) Scopes: define READ_PROFILE WRITE_PROFILE, middleware checks user.scopes includes required. Security: always HTTPS, tokens in httpOnly cookie, short expires, PKCE mandatory for public clients.',
  confidence: 0.96,
  blast_radius: { files: 2, lines: 250 },
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
