const https = require('https');
const crypto = require('crypto');

const nodeId = 'node_f5adce7c099b38df';

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'fetch',
  message_id: 'msg_' + Date.now() + '_fetch',
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: { 
    asset_type: 'Capsule', 
    status: 'promoted',
    sort_by: 'gdi_score',
    limit: 5
  }
};

const data = JSON.stringify(payload);
console.log('Fetching with query...');

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/fetch',
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
    console.log('Body:', body.substring(0, 2000));
    try {
      const r = JSON.parse(body);
      console.log('\nParsed keys:', Object.keys(r));
      console.log('Payload keys:', r.payload ? Object.keys(r.payload) : 'none');
    } catch(e) {
      console.log('Parse error:', e.message);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
