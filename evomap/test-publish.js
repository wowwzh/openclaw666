const https = require('https');

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_123456',
  sender_id: 'hub_test',
  timestamp: '2026-01-01T00:00:00Z',
  payload: {
    asset_type: 'Capsule',
    trigger: ['swarm'],
    summary: 'Test summary',
    content: 'Test content',
    gene: {
      asset_id: 'gene_1',
      type: 'Gene',
      summary: 'Test gene',
      category: 'innovate',
      signals_match: ['swarm']
    },
    bundle_gene: {
      asset_id: 'gene_1',
      type: 'Gene',
      summary: 'Test bundle',
      category: 'innovate',
      signals_match: ['swarm']
    }
  }
};

const data = JSON.stringify(payload);
console.log(data);

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
