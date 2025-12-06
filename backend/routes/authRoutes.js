const express = require('express');
const { register, login, updateProfile, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', auth, updateProfile);
router.get('/profile', auth, getProfile);

module.exports = router;