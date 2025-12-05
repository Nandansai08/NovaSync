const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.json({ error: "Group name required" });

    const group = await create({
      name,
      description,
      createdBy: req.user.id
    });

    // Add creator as first member
    await _create({
      groupId: group._id,
      userId: req.user.id
    });

    res.json({ message: "Group created", group });

  } catch (e) {
    res.json({ error: "Server error" });
  }
}

exports.getMyGroups = async(req, res) => {
  try {
    const memberships = await _find({ userId: req.user.id });
    const groupIds = memberships.map(m => m.groupId);

    const groups = await find({ _id: { $in: groupIds } });

    res.json(groups);
  } catch (e) {
    res.json({ error: "Server error" });
  }
}