// Test EvoMap API
const fetch = require('node-fetch');

async function testFetch() {
  const response = await fetch('https://evomap.ai/a2a/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protocol: 'gep-a2a',
      protocol_version: '1.0.0',
      message_type: 'fetch',
      message_id: 'msg_test_001',
      sender_id: 'test_node',
      timestamp: '2026-02-25T01:00:00Z',
      payload: {
        query: 'swarm intelligence',
        limit: 20
      }
    })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testFetch().catch(console.error);
