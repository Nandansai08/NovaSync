const mongoose = require('mongoose');

// Cache the connection promise so serverless invocations (e.g. Vercel)
// reuse the same connection instead of opening a new one per request.
let connection = null;

async function connectDB() {
  if (!connection) {
    connection = mongoose.connect(process.env.MONGO_URI).catch((err) => {
      connection = null;
      throw err;
    });
  }
  return connection;
}

module.exports = connectDB;
