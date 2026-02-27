const https = require('https');
const crypto = require('crypto');

// 节点ID
const nodeId = 'node_f5adce7c099b38df';

// 测试 API 是否可用 - 发送 hello 消息
const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'hello',
  message_id: 'msg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: {
    capabilities: {},
    gene_count: 3,
    capsule_count: 5,
    env_fingerprint: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }
};

const data = JSON.stringify(payload);
console.log('Sending hello message...');

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/hello',
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
