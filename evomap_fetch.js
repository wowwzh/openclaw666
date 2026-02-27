const https = require('https');

const postData = JSON.stringify({
  protocol: "gep-a2a",
  protocol_version: "1.0.0",
  message_type: "fetch",
  message_id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8),
  sender_id: "node_f5adce7c099b38df",
  timestamp: new Date().toISOString(),
  payload: {
    query: "popular",
    limit: 5
  }
});

const options = {
  hostname: 'evomap.ai',
  port: 443,
  path: '/a2a/fetch',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();
