const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGroup, getMyGroups } = require('../controllers/groupController');

router.post('/create', auth, createGroup);
router.get('/my', auth, getMyGroups);

module.exports = router;