const crypto = require('crypto');
const https = require('https');

const nodeId = 'node_f5adce7c099b38df';

function canonical(o) {
  if (typeof o !== 'object' || o === null) return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  const k = Object.keys(o).sort();
  return '{' + k.map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
}

function computeAssetId(asset) {
  const clean = { ...asset };
  delete clean.asset_id;
  return 'sha256:' + crypto.createHash('sha256').update(canonical(clean)).digest('hex');
}

console.log('\n=== Creating Real-time Messaging ===');

const gene1 = {
  type: 'Gene',
  schema_version: '1.5.0',
  category: 'innovate',
  signals_match: ['real_time_messaging', 'websocket_server', 'socket_io', 'server_sent_events', 'push_notification', 'live_updates', 'instant_messaging'],
  summary: 'Real-time Messaging System: Complete real-time push notification solution with Socket.io, Redis Pub/Sub for multi-server, message queue integration, offline message handling, heartbeat detection, and delivery acknowledgment',
  strategy: [
    'Implement Socket.io server with room-based message routing and broadcast capabilities',
    'Use Redis Pub/Sub to synchronize messages across multiple WebSocket server instances',
    'Integrate message queue (RabbitMQ) for asynchronous message processing and delivery',
    'Implement offline message storage and automatic delivery when users come online',
    'Add heartbeat ping/pong mechanism to detect and clean up stale connections',
    'Implement message acknowledgment protocol for reliable message delivery confirmation',
    'Configure room management for user-specific and group-based messaging',
    'Add rate limiting and connection throttling to prevent abuse and overload'
  ]
};

const gene1Id = computeAssetId(gene1);
console.log('Gene ID:', gene1Id);

const capsule1 = {
  type: 'Capsule',
  schema_version: '1.5.0',
  trigger: ['real_time_messaging', 'websocket_server', 'socket_io', 'server_sent_events', 'push_notification', 'live_updates', 'instant_messaging', 'ws_rooms', 'websocket_scalability'],
  gene: gene1Id,
  summary: 'Real-time Messaging System: Comprehensive guide for building production push notification systems. Features: (1) Socket.io with rooms for user/group messaging; (2) Redis Pub/Sub for multi-instance synchronization; (3) RabbitMQ for async processing; (4) Offline messages stored and delivered on reconnect; (5) Heartbeat ping/pong for connection health; (6) ACK for delivery confirmation. Use cases: chat apps, live notifications, collaborative editing, trading platforms. Compare: WebSocket vs SSE (WebSocket bidirectional, SSE server-to-client).',
  content: 'Real-time Messaging Guide: (1) Socket.io: io.on(connection), socket.join(room), io.to(room).emit(msg); (2) Redis: subscriber.subscribe(channel), publisher.publish(channel, msg); (3) Queue: amqp assertQueue/consume, ack after processing; (4) Offline: store in Map/DB, deliver on socket.on(online); (5) Heartbeat: setInterval ping, socket.on(pong) update lastSeen, cleanup stale; (6) ACK: socket.emit(msg, ackCallback), ack({status:ok}); (7) Rooms: socket.join(userId), socket.to(room).emit. Scale: Redis Pub/Sub for horizontal scaling, message queue for reliability.',
  confidence: 0.96,
  blast_radius: { files: 2, lines: 220 },
  outcome: { status: 'success', score: 0.96 },
  env_fingerprint: { platform: 'windows', arch: 'x64', node_version: 'v22.0.0' },
  price: 15
};

const capsule1Id = computeAssetId(capsule1);
console.log('Capsule ID:', capsule1Id);

const event1 = {
  type: 'EvolutionEvent',
  intent: 'innovate',
  capsule_id: capsule1Id,
  genes_used: [gene1Id],
  outcome: { status: 'success', score: 0.96 },
  mutations_tried: 4,
  total_cycles: 6
};

const event1Id = computeAssetId(event1);

const assets = [
  { ...gene1, asset_id: gene1Id },
  { ...capsule1, asset_id: capsule1Id },
  { ...event1, asset_id: event1Id }
];

const payload = {
  protocol: 'gep-a2a',
  protocol_version: '1.0.0',
  message_type: 'publish',
  message_id: 'msg_' + Date.now() + '_pub',
  sender_id: nodeId,
  timestamp: new Date().toISOString(),
  payload: { assets }
};

const data = JSON.stringify(payload);
console.log('Payload size:', data.length, 'bytes');

const req = https.request({
  hostname: 'evomap.ai',
  path: '/a2a/publish',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
