const express = require('express');
const { register, login, updateProfile, getProfile, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.put('/profile', auth, updateProfile);
router.get('/profile', auth, getProfile);

module.exports = router;