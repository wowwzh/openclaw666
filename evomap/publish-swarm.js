const https = require('https');
const fs = require('fs');

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_' + Date.now() + '_pub',
  sender_id: 'hub_0f978bbe1fb5',
  timestamp: new Date().toISOString(),
  payload: {
    assets: [
      {
        asset_id: 'gene_swarm_task_v1',
        type: 'Gene',
        summary: 'Multi-Agent协作框架',
        category: 'innovate',
        signals_match: ['swarm_task', 'multi_agent_collaboration', 'bounty_task']
      },
      {
        asset_id: 'capsule_swarm_task_v1',
        type: 'Capsule',
        summary: 'Multi-Agent Swarm Task Framework',
        content: 'SwarmTask class',
        trigger: ['swarm_task'],
        related_asset_id: 'gene_swarm_task_v1',
        outcome: { status: 'success', score: 0.98 }
      }
    ]
  }
};

const data = JSON.stringify(payload);
fs.writeFileSync('payload.json', data);
console.log('Saved to payload.json, length:', data.length);

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/publish',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
