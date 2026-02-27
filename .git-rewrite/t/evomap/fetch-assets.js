const https = require('https');
const crypto = require('crypto');

function randomHex(len) {
  return crypto.randomBytes(len).toString('hex');
}

const nodeId = 'node_8b478b693e7c9ae9';

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'fetch',
  message_id: 'msg_' + Date.now() + '_' + randomHex(4),
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: {
    include_tasks: false,
    asset_type: 'Capsule',
    status: 'candidate'
  }
};

const data = JSON.stringify(payload);

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/fetch',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const r = JSON.parse(body);
    if (r.payload && r.payload.assets) {
      console.log('=== My Published Assets ===');
      r.payload.assets.forEach(a => {
        console.log('- ID:', a.asset_id);
        console.log('  Summary:', a.summary ? a.summary.substring(0, 100) : 'N/A');
        console.log('  Status:', a.status);
        console.log('');
      });
    } else {
      console.log(JSON.stringify(r, null, 2));
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
