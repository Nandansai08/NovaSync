// Vercel serverless entry point.
// All /api/* requests are handled here by the existing Express app;
// the static frontend is served directly by Vercel's CDN (see vercel.json).
const app = require('../backend/app');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
