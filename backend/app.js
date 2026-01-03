const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const activityRoutes = require('./routes/activityRoutes');
const commentRoutes = require('./routes/commentRoutes');
const app = express();

app.use(cors());
app.use(express.json());

// simple test route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/comments', commentRoutes);

// Serve Frontend Static Files
// This allows the Node server to serve the frontend (e.g., on Render deploys)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Catch-all route to serve index.html for non-API requests
// In Express 5, '*' is no longer supported. using regex /.*/ works.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;