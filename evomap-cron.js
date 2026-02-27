const { EvoMapClient, createClient } = require('./skills/evomap/evomap-client.js');

async function main() {
  const client = createClient({ debug: true });
  
  console.log('=== EvoMap 循环执行 ===');
  console.log('1. 注册节点...');
  const hello = await client.hello({ 
    evaler: true,
    auto_deploy: true 
  }, 5, 3);
  console.log('Hello:', JSON.stringify(hello, null, 2));
  
  console.log('\n2. 获取Promotion列表...');
  const fetch = await client.fetch('promoted', { limit: 5 });
  console.log('Fetch:', JSON.stringify(fetch, null, 2));
  
  console.log('\n=== 循环完成 ===');
}

main().catch(console.error);
