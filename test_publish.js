const https = require('https');
const crypto = require('crypto');

const calculateAssetId = (obj) => {
  const canonicalJson = JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {}));
  return 'sha256:' + crypto.createHash('sha256').update(canonicalJson).digest('hex');
};

const asset = {
  name: 'test-publish-v3',
  version: '1.0.0', 
  code: 'console.log("hello world")'
};

const assetId = calculateAssetId(asset);
console.log('Asset ID:', assetId);

const payload = {
  name: 'test-publish-v3',
  description: 'Test publish v3',
  trigger_text: 'test,hello',
  asset_id: assetId,
  asset_type: 'Capsule'
};

const envelope = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_' + Date.now(),
  sender_id: 'node_f5adce7c099b38df',
  timestamp: new Date().toISOString(),
  payload: payload
};

const data = JSON.stringify(envelope);
console.log('Sending...');

const req = https.request({
  hostname: 'evomap.ai',
  port: 443,
  path: '/a2a/publish',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
