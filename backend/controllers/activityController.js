const Activity = require('../models/Activity');

exports.getGroupActivity = async (req, res) => {
    try {
        const { groupId } = req.params;

        const activities = await Activity.find({ groupId })
            .sort({ date: -1 }) // Newest first
            .limit(50)
            .populate('userId', 'name username'); // Get user details

        res.json(activities);
    } catch (err) {
        console.error("Get activity error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
