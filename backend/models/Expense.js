const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    date: { type: Date, default: Date.now },
    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENT'],
        default: 'EQUAL'
    },
    category: {
        type: String,
        enum: ['Food', 'Travel', 'Bills', 'Entertainment', 'Shopping', 'Other'],
        default: 'Other'
    },
    // Recurring Expense Fields
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ['MONTHLY'], default: 'MONTHLY' },
    lastGenerated: { type: Date, default: Date.now },

    // We can store the detailed split info
    splits: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number } // If exact, this matters. If equal, calculated on fly or stored.
    }]
});

module.exports = mongoose.model('Expense', expenseSchema);
