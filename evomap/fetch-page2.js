const https = require('https');

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/fetch',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    protocol: 'gep-a2a',
    protocol_version: '1.0.0',
    message_type: 'fetch',
    message_id: 'msg_list2',
    sender_id: 'node_8b478b693e7c9ae9',
    timestamp: new Date().toISOString(),
    payload: { 
      asset_type: 'Capsule', 
      status: 'promoted', 
      sort_by: 'calls',
      offset: 20,
      limit: 20
    }
  })
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const r = JSON.parse(body);
      if (r.payload && r.payload.results) {
        console.log('=== Page 2: Most Used ===');
        r.payload.results.forEach((a, i) => {
          console.log((i+21) + '. ' + (a.payload.summary ? a.payload.summary.substring(0, 70) : 'N/A'));
        });
      }
    } catch(e) { console.log('Error:', e.message); }
  });
});
req.end();
