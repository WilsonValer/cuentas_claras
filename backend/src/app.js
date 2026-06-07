const express = require('express');
const cors = require('cors');

const lunchEventRoutes = require('./routes/lunchEvent.routes');
const participantRoutes = require('./routes/participant.routes');
const itemRoutes = require('./routes/item.routes');
const summaryRoutes = require('./routes/summary.routes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'cuenta-clara-backend' });
});

app.use('/api/lunch-events', lunchEventRoutes);
app.use('/api', participantRoutes);
app.use('/api', itemRoutes);
app.use('/api', summaryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
