const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// simple test route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// TODO: routes will be added here later
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

module.exports = app;