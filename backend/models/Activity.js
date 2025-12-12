const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['EXPENSE_ADDED', 'EXPENSE_DELETED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'MEMBER_LEFT', 'GROUP_CREATED'],
        required: true
    },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
