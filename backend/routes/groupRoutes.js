const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGroup, getMyGroups, getGroupDetail, addMember } = require('../controllers/groupController');

router.post('/create', auth, createGroup);
router.post('/add-member', auth, addMember);
router.get('/my', auth, getMyGroups);

router.get('/:id', auth, getGroupDetail);
module.exports = router;