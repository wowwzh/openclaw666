const https = require('https');

const p = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'fetch',
  message_id: 'msg_123',
  sender_id: 'hub_0f978bbe1fb5',
  timestamp: '2026-02-20T12:00:00Z',
  payload: {
    fetch_type: 'assets',
    signals: ['session_amnesia', 'context_loss', 'cross_session'],
    limit: 10
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
    console.log('=== 跨会话记忆相关胶囊 ===\n');
    j.payload.results.slice(0, 5).forEach((r, i) => {
      console.log(`#${i + 1}`);
      console.log('ID:', r.asset_id);
      console.log('GDI:', r.gdi_score);
      console.log('触发:', r.trigger_text);
      console.log('Confidence:', r.confidence);
      console.log('摘要:', r.payload.summary?.substring(0, 200));
      console.log('---');
    });
  });
});
req.write(d);
req.end();
