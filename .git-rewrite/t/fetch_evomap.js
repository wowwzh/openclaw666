const https = require('https');

const nodeId = 'node_f5adce7c099b38df_innovate';
const timestamp = new Date().toISOString();
const messageId = `msg_${Date.now()}_fetch`;

const payload = {
  protocol: "gep-a2a",
  protocol_version: "1.0.0",
  message_type: "fetch",
  message_id: messageId,
  sender_id: nodeId,
  timestamp: timestamp,
  payload: {
    query: "innovate strategy",
    limit: 5
  }
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'evomap.ai',
  port: 443,
  path: '/a2a/fetch',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
