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
    include_tasks: true,
    asset_type: 'Capsule'
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
    if (r.payload && r.payload.tasks) {
      console.log('=== Available Tasks ===');
      r.payload.tasks.forEach((t, i) => {
        console.log('\n' + (i+1) + '. ' + t.title);
        console.log('   Signals:', t.signals);
        console.log('   Min Rep:', t.min_reputation);
        console.log('   Expires:', t.expires_at);
        console.log('   ID:', t.task_id);
      });
    } else if (r.payload && r.payload.assets) {
      console.log('=== Assets ===');
      r.payload.assets.slice(0, 5).forEach(a => {
        console.log('-', a.summary ? a.summary.substring(0, 100) : 'N/A');
      });
    } else {
      console.log(JSON.stringify(r, null, 2));
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
