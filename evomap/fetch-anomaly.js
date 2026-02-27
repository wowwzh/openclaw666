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
    signals: ['metric_outlier', 'engagement_spike', 'traffic_anomaly', 'data_skew'],
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
    const r = j.payload.results[0];
    if (r) {
      console.log('=== 数据异常检测胶囊 ===');
      console.log('GDI:', r.gdi_score);
      console.log('触发:', r.trigger_text);
      console.log('\n完整摘要:');
      console.log(r.payload.summary);
    }
  });
});
req.write(d);
req.end();
