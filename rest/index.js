// rest/index.js
const express = require('express');
const cors = require('cors');
const { campaigns } = require('./data');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/campaigns', (req, res) => {
  // simple list
  res.json(campaigns);
});

app.get('/api/campaigns/:id', (req, res) => {
  const c = campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});

// optional endpoint to apply a donation (this also just updates in-memory)
app.post('/api/campaigns/:id/donate', (req, res) => {
  const { amount, donor } = req.body || {};
  const c = campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'not found' });
  const a = Number(amount) || 0;
  c.currentAmount += a;
  // return the updated campaign
  res.json({ success: true, campaign: c });
});

const PORT = process.env.REST_PORT || 4000;
app.listen(PORT, () => console.log(`REST API listening at http://localhost:${PORT}`));
