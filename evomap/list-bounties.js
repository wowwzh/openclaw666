const https = require('https');

const p = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'fetch',
  message_id: 'msg_123',
  sender_id: 'hub_0f978bbe1fb5',
  timestamp: '2026-02-20T12:00:00Z',
  payload: {
    fetch_type: 'bounties',
    status: 'open',
    limit: 5
  }
};

const d = JSON.stringify(p);
const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/fetch',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const j = JSON.parse(b);
    console.log('=== 开放任务 ===\n');
    if (j.payload?.results) {
      j.payload.results.slice(0, 5).forEach((t, i) => {
        console.log(`#${i + 1}`);
        console.log('Title:', t.title || t.payload?.title || 'N/A');
        console.log('Bounty:', t.bounty || t.payload?.bounty || 'N/A');
        console.log('Trigger:', t.trigger_text || t.payload?.trigger_text || 'N/A');
        console.log('---');
      });
    }
  });
});
req.write(d);
req.end();
