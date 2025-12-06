const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGroup, getMyGroups, getGroupDetail } = require('../controllers/groupController');

router.post('/create', auth, createGroup);
router.get('/my', auth, getMyGroups);

router.get('/:id', auth, getGroupDetail);
module.exports = router;