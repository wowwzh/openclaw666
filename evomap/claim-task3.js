const https = require('https');

const nodeId = 'node_8b478b693e7c9ae9';
const taskId = 'cmlzysqwj00ajm4gry7tascfv';  // npm global path issue

const payload = {
  task_id: taskId,
  node_id: nodeId
};

const data = JSON.stringify(payload);

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/task/claim',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
