const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');
const settlementService = require('../services/settlementService');

exports.addMember = async (req, res) => {
  try {
    const { groupId, username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exists = await GroupMember.findOne({ groupId, userId: user._id });
    if (exists) {
      return res.status(400).json({ error: "User already in group" });
    }

    await GroupMember.create({ groupId, userId: user._id });

    await Activity.create({
      groupId,
      userId: req.user.id,
      type: 'MEMBER_ADDED',
      description: `${req.user.name} added ${user.name}`
    });

    res.json({ message: "Member added", user: { id: user._id, name: user.name, username: user.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.json({ error: "Group name required" });

    const group = await Group.create({
      name,
      description,
      createdBy: req.user.id
    });

    await GroupMember.create({
      groupId: group._id,
      userId: req.user.id
    });

    res.json({ message: "Group created", group });

    await Activity.create({
      groupId: group._id,
      userId: req.user.id,
      type: 'GROUP_CREATED',
      description: `${req.user.name} created the group "${name}"`
    });
  } catch (e) {
    console.error("Error creating group:", e);
    res.json({ error: e.message || "Server error" });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.find({ userId: req.user.id });
    const groupIds = memberships.map(m => m.groupId);

    const groups = await Group.find({ _id: { $in: groupIds } });

    res.json(groups);
  } catch (e) {
    res.json({ error: "Server error" });
  }
};

exports.getGroupDetail = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const memberships = await GroupMember
      .find({ groupId })
      .populate('userId', 'name username contact');

    const members = memberships.map(m => ({
      id: m.userId._id,
      name: m.userId.name,
      username: m.userId.username,
      contact: m.userId.contact
    }));

    res.json({ group, members });
  } catch (err) {
    console.error(err);
    res.json({ error: 'Server error' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only group admin can remove members' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot remove self. Use 'Leave Group'." });
    }

    const { balance, isMember } = await settlementService.getMemberBalance(groupId, userId);
    if (!isMember) {
      return res.status(404).json({ error: 'User is not a member of this group.' });
    }

    if (balance !== undefined && Math.abs(balance) >= 0.01) {
      const direction = balance > 0 ? 'is owed' : 'owes';
      return res.status(400).json({
        error: 'Cannot remove member: they ' + direction + ' $' + Math.abs(balance).toFixed(2) + '. Settle first.'
      });
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const { balance: freshBalance } = await settlementService.getMemberBalance(groupId, userId);
      if (freshBalance !== undefined && Math.abs(freshBalance) >= 0.01) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Balance changed during operation. Try again.' });
      }

      await GroupMember.findOneAndDelete({ groupId, userId }).session(session);

      const removedUser = await User.findById(userId);
      const description = removedUser
        ? req.user.name + ' removed ' + removedUser.name
        : req.user.name + ' removed user ' + userId;
      await Activity.create([{
        groupId,
        userId: req.user.id,
        type: 'MEMBER_REMOVED',
        description
      }], { session });

      await session.commitTransaction();
    } catch (txErr) {
      await session.abortTransaction();
      throw txErr;
    } finally {
      session.endSession();
    }

    res.json({ message: 'Member removed' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const membership = await GroupMember.findOne({ groupId, userId: req.user.id });
    if (!membership) {
      return res.status(404).json({ error: 'You are not a member of this group.' });
    }

    const { balance } = await settlementService.getMemberBalance(groupId, req.user.id);

    if (balance !== undefined && Math.abs(balance) >= 0.01) {
      const direction = balance > 0 ? 'are owed' : 'owe';
      return res.status(400).json({
        error: 'Cannot leave group: you ' + direction + ' $' + Math.abs(balance).toFixed(2) + '. Settle first.'
      });
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const { balance: freshBalance } = await settlementService.getMemberBalance(groupId, req.user.id);
      if (freshBalance !== undefined && Math.abs(freshBalance) >= 0.01) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Balance changed during operation. Try again.' });
      }

      await GroupMember.findOneAndDelete({ groupId, userId: req.user.id }).session(session);

      const user = await User.findById(req.user.id);
      const group = await Group.findById(groupId);
      const description = user
        ? (group
            ? user.name + ' left the group "' + group.name + '"'
            : user.name + ' left the group')
        : 'User ' + req.user.id + ' left the group';
      await Activity.create([{
        groupId,
        userId: req.user.id,
        type: 'MEMBER_LEFT',
        description
      }], { session });

      await session.commitTransaction();
    } catch (txErr) {
      await session.abortTransaction();
      throw txErr;
    } finally {
      session.endSession();
    }

    res.json({ message: 'You have left the group' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};
