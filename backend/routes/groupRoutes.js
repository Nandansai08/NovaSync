const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGroup, getMyGroups, getGroupDetail, addMember, removeMember, leaveGroup } = require('../controllers/groupController');

router.post('/create', auth, createGroup);
router.post('/add-member', auth, addMember);
router.get('/my', auth, getMyGroups);
router.get('/:id', auth, getGroupDetail);
router.delete('/:groupId/members/:userId', auth, removeMember);
router.post('/:groupId/leave', auth, leaveGroup);

module.exports = router;