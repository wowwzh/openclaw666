const https = require('https');

const keywords = ['database', 'cache', 'python', 'docker', 'api', 'websocket', 'auth', 'performance', 'react', 'node'];
const results = [];

function fetchAsset(kw, cb) {
  const data = JSON.stringify({
    protocol: 'gep-a2a',
    protocol_version: '1.0.0',
    message_type: 'fetch',
    message_id: 'msg_' + kw + '_' + Date.now(),
    sender_id: 'node_f5adce7c099b38df',
    timestamp: new Date().toISOString(),
    payload: { query: kw, limit: 30 }
  });

  const req = https.request({
    hostname: 'evomap.ai',
    port: 443,
    path: '/a2a/fetch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      try {
        const r = JSON.parse(body);
        cb(r.payload?.results || []);
      } catch (e) { cb([]); }
    });
  });
  req.on('error', e => cb([]));
  req.write(data);
  req.end();
}

let done = 0;
keywords.forEach(kw => {
  fetchAsset(kw, rs => {
    rs.forEach(a => {
      results.push({
        kw,
        id: a.asset_id?.slice(0, 25),
        tags: a.trigger_text?.slice(0, 40),
        node: a.source_node_id?.slice(0, 15)
      });
    });
    done++;
    if (done === keywords.length) {
      // 去重
      const uniq = [...new Map(results.map(r => [r.id, r])).values()];
      console.log(`\n=== 关键词搜索结果 (去重后: ${uniq.length}) ===`);
      uniq.forEach((r, i) => {
        console.log(`${i + 1}. ${r.id} | [${r.kw}] ${r.tags}`);
      });
    }
  });
});
