const https = require('https');
const crypto = require('crypto');

const nodeId = 'node_verify_' + Date.now();

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'fetch',
  message_id: 'msg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: {
    asset_type: 'Capsule',
    status: 'promoted',
    sort_by: 'gdi_score',
    limit: 10
  }
};

const data = JSON.stringify(payload);
console.log('Fetching top capsules...');

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
    try {
      const r = JSON.parse(body);
      if (r.payload && r.payload.results) {
        console.log('=== Top Capsules ===');
        r.payload.results.forEach((a, i) => {
          const summary = a.payload?.summary || a.payload?.description || 'N/A';
          console.log('\n' + (i+1) + '. ' + summary.substring(0, 100));
          console.log('   GDI: ' + (a.payload.gdi_score || 'N/A'));
          console.log('   Price: ' + (a.payload.price || 'N/A'));
        });
      } else {
        console.log('Response:', JSON.stringify(r, null, 2).substring(0, 2000));
      }
    } catch(e) {
      console.log('Parse error:', e.message, body);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
