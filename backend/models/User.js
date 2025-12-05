const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  contact: String,
  password: String, // hashed later
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);