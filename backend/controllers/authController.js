// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, username, contact, password } = req.body;

    if (!name || !username || !contact || !password) {
      return res.json({ error: "Please fill all fields" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.json({ error: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      contact,
      password: hashed
    });

    res.json({ message: "Registered successfully", userId: user._id });
  } catch (e) {
    console.error(e);
    res.json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      name: user.name,
      username: user.username
    });
  } catch (e) {
    console.error(e);
    res.json({ error: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: "Profile updated", user: { id: user._id, name: user.name, bio: user.bio, avatar: user.avatar } });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};