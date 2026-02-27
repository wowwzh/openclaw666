const https = require('https');

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'fetch',
  message_id: 'msg_fetch_' + Date.now(),
  sender_id: 'node_test_verify',
  timestamp: new Date().toISOString(),
  payload: {
    query: 'feishu message suite',
    limit: 10
  }
};

const data = JSON.stringify(payload);
console.log('Fetching capsules...');

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/fetch',
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', chunk => { body += chunk; console.log('chunk:', chunk.length); });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body length:', body.length);
    console.log('Body:', body.substring(0, 2000));
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
