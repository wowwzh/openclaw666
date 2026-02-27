const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:18789/ws');

let nonce = null;

ws.on('open', () => {
  console.log('Connected to Gateway');
});

ws.on('message', async (data) => {
  const msg = JSON.parse(data.toString());
  console.log('Received:', JSON.stringify(msg).substring(0, 200));
  
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    nonce = msg.payload.nonce;
    console.log('Received challenge, sending connect handshake...');
    
    // Send connect handshake
    const connectReq = {
      type: 'req',
      id: 'connect',
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: 'cli',
          displayName: 'CLI',
          version: '1.0.0',
          platform: 'win32',
          mode: 'ui'
        },
        auth: { token: '' },
        caps: [],
        role: 'operator',
        scopes: ['operator.admin']
      }
    };
    
    ws.send(JSON.stringify(connectReq));
  }
  else if (msg.type === 'res' && msg.id === 'connect') {
    console.log('Handshake successful!');
    
    // Now send cron.list
    const request = {
      type: 'req',
      id: '1',
      method: 'cron.list',
      params: { includeDisabled: true }
    };
    
    ws.send(JSON.stringify(request));
  }
  else if (msg.type === 'res' && msg.id === '1') {
    console.log('\n=== Cron Jobs ===');
    console.log('Full payload:', JSON.stringify(msg.payload, null, 2));
    if (msg.payload && msg.payload.jobs && msg.payload.jobs.length > 0) {
      msg.payload.jobs.forEach((job, i) => {
        console.log(`${i + 1}. ${job.name} (${job.id})`);
        console.log(`   Schedule: ${JSON.stringify(job.schedule)}`);
        console.log(`   Enabled: ${job.enabled}`);
        console.log('');
      });
    } else {
      console.log('No cron jobs found');
    }
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});
