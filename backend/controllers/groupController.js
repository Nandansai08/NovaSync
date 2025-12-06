const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');

exports.addMember = async (req, res) => {
  try {
    const { groupId, username } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already in group
    const exists = await GroupMember.findOne({ groupId, userId: user._id });
    if (exists) {
      return res.status(400).json({ error: "User already in group" });
    }

    await GroupMember.create({ groupId, userId: user._id });
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

    // Add creator as first member
    await GroupMember.create({
      groupId: group._id,
      userId: req.user.id
    });

    res.json({ message: "Group created", group });
  } catch (e) {
    console.error("Error creating group:", e);
    res.json({ error: e.message || "Server error" });
  }
}

exports.getMyGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.find({ userId: req.user.id });
    const groupIds = memberships.map(m => m.groupId);

    const groups = await Group.find({ _id: { $in: groupIds } });

    res.json(groups);
  } catch (e) {
    res.json({ error: "Server error" });
  }
}
// GET /api/groups/:id  -> one group + members
exports.getGroupDetail = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const memberships = await GroupMember
      .find({ groupId })
      .populate("userId", "name username contact");

    const members = memberships.map(m => ({
      id: m.userId._id,
      name: m.userId.name,
      username: m.userId.username,
      contact: m.userId.contact
    }));

    res.json({ group, members });
  } catch (err) {
    console.error(err);
    res.json({ error: "Server error" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only creator can remove members
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only group admin can remove members" });
    }

    // Cannot remove self via this route (use leave instead)
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot remove self. Use 'Leave Group'." });
    }

    await GroupMember.findOneAndDelete({ groupId, userId });
    res.json({ message: "Member removed" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    await GroupMember.findOneAndDelete({ groupId, userId: req.user.id });
    res.json({ message: "You have left the group" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};