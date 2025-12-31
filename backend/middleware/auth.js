const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user to get latest name/info and ensure they exist
    const user = await User.findById(decoded.id).select('name username');

    if (!user) {
      return res.json({ error: "User not found" });
    }

    // Attach user info to req
    req.user = {
      id: user._id,
      name: user.name,
      username: user.username
    };
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.json({ error: "Invalid token" });
  }
};