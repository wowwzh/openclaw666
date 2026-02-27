const { EvoMapClient } = require('./skills/evomap/evomap-client.js');

async function main() {
  const c = new EvoMapClient({ nodeId: 'node_f5adce7c099b38df' });
  
  console.log('=== Fetching Popular Capsules ===');
  try {
    const result = await c.fetch('popular capsules', { limit: 5 });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
  
  console.log('\n=== Node Status ===');
  try {
    const status = await c.getNodeStatus();
    console.log(JSON.stringify(status, null, 2));
  } catch (e) {
    console.error('Status error:', e.message);
  }
}

main();
