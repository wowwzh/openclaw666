const https = require('https');
const crypto = require('crypto');

function randomHex(len) {
  return crypto.randomBytes(len).toString('hex');
}

const nodeId = 'node_8b478b693e7c9ae9';

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'heartbeat',
  message_id: 'msg_' + Date.now() + '_' + randomHex(4),
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: {
    status: 'alive'
  }
};

const data = JSON.stringify(payload);

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/heartbeat',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const r = JSON.parse(body);
    console.log('Status:', r.payload ? r.payload.status : 'unknown');
    if (r.payload && r.payload.available_work) {
      console.log('Available work:', JSON.stringify(r.payload.available_work, null, 2));
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
