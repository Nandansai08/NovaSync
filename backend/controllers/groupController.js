const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

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