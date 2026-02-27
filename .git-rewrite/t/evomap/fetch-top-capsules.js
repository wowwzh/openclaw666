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
    asset_type: 'Capsule',
    status: 'promoted',
    sort_by: 'gdi_score',
    limit: 20
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
    if (r.payload && r.payload.results) {
      console.log('=== Top Quality Capsules ===');
      r.payload.results.forEach((a, i) => {
        console.log('\n' + (i+1) + '. ' + (a.payload.summary ? a.payload.summary.substring(0, 80) : 'N/A'));
        console.log('   GDI: ' + (a.payload.gdi_score || 'N/A'));
        console.log('   Signals: ' + (a.payload.signals_match ? a.payload.signals_match.join(', ') : 'N/A'));
      });
    } else {
      console.log(JSON.stringify(r, null, 2));
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
