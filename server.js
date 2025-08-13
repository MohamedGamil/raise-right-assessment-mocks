const express = require('express');
const cors = require('cors');
const http = require('http');
const { ApolloServer, gql } = require('apollo-server-express');
const { GraphQLError } = require('graphql');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Shared campaign data (moved to single file for consistency)
const { campaigns } = require('./rest/data');

// ---------------------------------------------
// REST API
// ---------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

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
    campaign: (_, { id }) => {
      const item = campaigns.find(c => c.id === id);
      if (!item) return null;
      const lastDigit = Number(String(id).slice(-1)) || 0;
      const chance = (lastDigit % 3) === 0 ? 0.5 : 0.2;

      if (Math.random() < chance) {
        throw new GraphQLError('Partial data: donors could not be loaded', {
          extensions: { code: 'DONORS_PARTIAL_FAILURE' }
        });
      }
      return item;
    }
  }
};

async function startApollo() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });
}

// ---------------------------------------------
// WebSocket Server
// ---------------------------------------------
function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  function broadcast(obj) {
    const str = JSON.stringify(obj);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(str);
    });
  }

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.send(JSON.stringify({ type: 'welcome', timestamp: Date.now() }));
    ws.send(JSON.stringify({
      type: 'snapshot',
      campaigns: campaigns.map(c => ({
        id: c.id,
        currentAmount: c.currentAmount
      }))
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
            broadcast(ev);
          }
        }
      } catch (e) {
        console.warn('Invalid WS message', e.message);
      }
    });
  });

  // Simulate random donations
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
    broadcast(ev);
    console.log('Simulated donation broadcast', ev);
  }, 15000);
}

// ---------------------------------------------
// Server startup
// ---------------------------------------------
async function startServer() {
  await startApollo();
  const server = http.createServer(app);
  setupWebSocket(server);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`REST API at     http://localhost:${PORT}/api/campaigns`);
    console.log(`GraphQL API at  http://localhost:${PORT}/graphql`);
    console.log(`WebSocket at    ws://localhost:${PORT}/ws`);
  });
}

startServer();
