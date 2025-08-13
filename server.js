const express = require('express');
const cors = require('cors');
const http = require('http');
const { ApolloServer, gql } = require('apollo-server-express');
const { GraphQLError } = require('graphql');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Shared campaign data (moved to single file for consistency)
const { campaigns } = require('./graphql/data');


// ---------------------------------------------
// REST API
// ---------------------------------------------
const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: '*', // or specific origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// --- Health & root ---
app.get('/', (_req, res) => res.send('Raise Right mock server is running.'));
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

app.get('/api/campaigns', (req, res) => {
  res.json(campaigns);
});

app.get('/api/campaigns/:id', (req, res) => {
  const c = campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});

app.post('/api/campaigns/:id/donate', (req, res) => {
  const { amount, donor } = req.body || {};
  const c = campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  const a = Number(amount) || 0;
  c.currentAmount += a;
  res.json({ success: true, campaign: c });
});


// ---------------------------------------------
// GraphQL API
// ---------------------------------------------
const typeDefs = gql`
  type Donor {
    name: String!
    amount: Int!
  }

  type Campaign {
    id: ID!
    name: String
    goal: Int
    currentAmount: Int
    description: String
    donors: [Donor!]
  }

  type Query {
    campaign(id: ID!): Campaign
  }
`;

const resolvers = {
  Query: {
    campaign: (_parent, { id }) => {
      const item = campaigns.find(c => c.id === id);
      if (!item) return null;
      const lastDigit = Number(String(id).slice(-1)) || 0;
      const chance = (lastDigit % 3) === 0 ? 0.5 : 0.2; // simulate partial errors
      if (Math.random() < chance) {
        throw new GraphQLError('Partial data: donors could not be loaded', {
          extensions: { code: 'DONORS_PARTIAL_FAILURE' }
        });
      }
      return item;
    }
  }
};

async function mountGraphQL(app_) {
  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  apollo.applyMiddleware({ app_, path: '/graphql' });
}


// ---------------------------------------------
// WebSocket Server
// ---------------------------------------------
function mountWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  // Keep-alive (30s ping); required on many PaaS reverse proxies
  function heartbeat() { this.isAlive = true; }
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    console.log('WS client connected');
    ws.send(JSON.stringify({ type: 'welcome', timestamp: Date.now() }));
    ws.send(JSON.stringify({
      type: 'snapshot',
      campaigns: campaigns.map(c => ({ id: c.id, currentAmount: c.currentAmount }))
    }));

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.type === 'donation' && data.campaignId) {
          const amount = Number(data.amount) || 0;
          const c = campaigns.find(x => x.id === data.campaignId);
          if (c) {
            c.currentAmount += amount;
            const ev = {
              type: 'donation',
              campaignId: c.id,
              amount,
              donor: data.donor || 'anonymous',
              id: uuidv4(),
              timestamp: Date.now()
            };
            // broadcast
            const payload = JSON.stringify(ev);
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) client.send(payload);
            });
          }
        }
      } catch (e) {
        console.warn('Invalid WS message', e.message);
      }
    });
  });

  // Ping all clients every 30s; terminate dead sockets
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  // Simulated donations every 15s
  setInterval(() => {
    const pick = campaigns[Math.floor(Math.random() * campaigns.length)];
    const amount = Math.floor(Math.random() * 200) + 10;
    pick.currentAmount += amount;
    const ev = {
      type: 'donation',
      campaignId: pick.id,
      amount,
      donor: 'system',
      id: uuidv4(),
      timestamp: Date.now()
    };
    const payload = JSON.stringify(ev);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
    console.log('Simulated donation broadcast', ev);
  }, 15000);
}


// ---------------------------------------------
// Server startup
// ---------------------------------------------
(async () => {
  await mountGraphQL(app);

  const server = http.createServer(app);
  mountWebSocket(server);

  const PORT = process.env.PORT || 3000; // Railway injects PORT
  server.listen(PORT, () => {
    console.log(`HTTP server on http://localhost:${PORT}`);
    console.log(`REST     → GET  /api/campaigns`);
    console.log(`GraphQL  → POST /graphql`);
    console.log(`WS       → ws(s)://<host>/ws`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down...');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();
