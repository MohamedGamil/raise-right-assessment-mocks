// websocket/index.js
const WebSocket = require('ws');
const { campaigns } = require('../rest/data'); // share same in-memory campaign objects
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.WS_PORT || 4002;
const wss = new WebSocket.Server({ port: PORT }, () =>
  console.log(`WebSocket server listening on ws://localhost:${PORT}`)
);

// helper to broadcast
function broadcast(obj) {
  const str = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(str);
  });
}

wss.on('connection', (ws) => {
  console.log('client connected');

  // send a welcome and current snapshot
  ws.send(JSON.stringify({ type: 'welcome', timestamp: Date.now() }));
  ws.send(JSON.stringify({ type: 'snapshot', campaigns: campaigns.map(c => ({ id: c.id, currentAmount: c.currentAmount })) }));

  // if client sends donation message, apply it and broadcast
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'donation' && data.campaignId) {
        const amount = Number(data.amount) || 0;
        const c = campaigns.find(x => x.id === data.campaignId);
        if (c) {
          c.currentAmount += amount;
          // broadcast donation event
          const ev = { type: 'donation', campaignId: c.id, amount: amount, donor: data.donor || 'anonymous', id: uuidv4(), timestamp: Date.now() };
          broadcast(ev);
        }
      }
    } catch (e) {
      console.warn('invalid message', e.message);
    }
  });

});

// also simulate random donations every 10-20 seconds
setInterval(() => {
  const pick = campaigns[Math.floor(Math.random() * campaigns.length)];
  const amount = Math.floor(Math.random() * 200) + 10;
  pick.currentAmount += amount;
  const ev = { type: 'donation', campaignId: pick.id, amount, donor: 'system', id: uuidv4(), timestamp: Date.now() };
  broadcast(ev);
  console.log('broadcast simulated donation', ev);
}, 15000);
