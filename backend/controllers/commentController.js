const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
    try {
        const { groupId, text } = req.body;

        if (!groupId || !text) {
            return res.status(400).json({ error: "Group ID and text are required" });
        }

        const comment = await Comment.create({
            groupId,
            userId: req.user.id,
            text
        });

        // Populate user details for immediate display
        await comment.populate('userId', 'name username');

        res.json(comment);
    } catch (err) {
        console.error("Add comment error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getGroupComments = async (req, res) => {
    try {
        const { groupId } = req.params;

        const comments = await Comment.find({ groupId })
            .sort({ date: 1 }) // Oldest first (chronological)
            .populate('userId', 'name username');

        res.json(comments);
    } catch (err) {
        console.error("Get comments error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
