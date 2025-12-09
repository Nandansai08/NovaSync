const Expense = require('../models/Expense');
const GroupMember = require('../models/GroupMember');
const settlementService = require('../services/settlementService');

exports.addExpense = async (req, res) => {
    try {
        const { description, amount, groupId, splitType, splits: providedSplits } = req.body;
        const userId = req.user.id; // Payer

        if (!description || !amount || !groupId) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Validate amount is positive
        const expenseAmount = Number(amount);
        if (expenseAmount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }

        // Get all members
        const members = await GroupMember.find({ groupId });
        if (!members.length) {
            console.log("AddExpense: No members found for group", groupId);
            return res.status(400).json({ error: "Group has no members" });
        }

        let splits;
        const expenseSplitType = splitType || 'EQUAL';

        if (expenseSplitType === 'EXACT') {
            // Validate exact splits
            if (!providedSplits || !Array.isArray(providedSplits) || providedSplits.length === 0) {
                return res.status(400).json({ error: "Splits required for EXACT type" });
            }

            // Validate all split amounts are positive
            const hasNegative = providedSplits.some(s => Number(s.amount) <= 0);
            if (hasNegative) {
                return res.status(400).json({ error: "All split amounts must be greater than zero" });
            }

            // Validate sum equals total (with small tolerance for floating point)
            const sum = providedSplits.reduce((acc, s) => acc + Number(s.amount), 0);
            const totalAmount = Number(amount);

            if (Math.abs(sum - totalAmount) > 0.01) {
                return res.status(400).json({
                    error: `Split amounts (₹${sum.toFixed(2)}) must equal total (₹${totalAmount.toFixed(2)})`
                });
            }

            // Use provided splits
            splits = providedSplits.map(s => ({
                userId: s.userId,
                amount: Number(s.amount)
            }));

        } else if (expenseSplitType === 'PERCENT') {
            // Validate percent splits
            if (!providedSplits || !Array.isArray(providedSplits) || providedSplits.length === 0) {
                return res.status(400).json({ error: "Splits required for PERCENT type" });
            }

            // Validate sum equals 100%
            const sum = providedSplits.reduce((acc, s) => acc + Number(s.percentage), 0);
            if (Math.abs(sum - 100) > 0.01) {
                return res.status(400).json({
                    error: `Percentages must sum to 100% (Current: ${sum}%)`
                });
            }

            splits = [];
            let totalCalculated = 0;
            const totalAmount = Number(amount);

            // Calculate amounts
            for (let i = 0; i < providedSplits.length; i++) {
                const s = providedSplits[i];
                // Calculate share: (percent / 100) * total
                let share = Number(((Number(s.percentage) / 100) * totalAmount).toFixed(2));

                splits.push({
                    userId: s.userId,
                    amount: share
                });
                totalCalculated += share;
            }

            // Fix rounding difference
            let diff = Number((totalAmount - totalCalculated).toFixed(2));
            if (diff !== 0) {
                // Add difference to first user (simplest approach for small pennies)
                splits[0].amount = Number((splits[0].amount + diff).toFixed(2));
            }

        } else {
            // EQUAL split - divide equally among all members
            const splitAmount = Number((Number(amount) / members.length).toFixed(2));
            splits = members.map(m => ({
                userId: m.userId,
                amount: splitAmount
            }));
        }

        // Create Expense
        const expense = await Expense.create({
            description,
            amount: Number(amount),
            paidBy: userId,
            groupId,
            splitType: expenseSplitType,
            splits,
            date: new Date()
        });

        res.json(expense);
    } catch (err) {
        console.error("Add expense error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Sort by date desc
        const expenses = await Expense.find({ groupId })
            .sort({ date: -1 })
            .populate('paidBy', 'name username');

        res.json(expenses);
    } catch (err) {
        console.error("Get expenses error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getGroupBalances = async (req, res) => {
    try {
        const { groupId } = req.params;

        const expenses = await Expense.find({ groupId });
        const members = await GroupMember.find({ groupId }).populate('userId', 'name username');

        const { balances, plan } = settlementService.calculateBalances(expenses, members);

        const userMap = {};
        members.forEach(m => {
            if (m.userId) userMap[m.userId._id.toString()] = m.userId;
        });

        const readablePlan = plan.map(p => ({
            from: userMap[p.from]?.name || 'Unknown',
            to: userMap[p.to]?.name || 'Unknown',
            amount: p.amount
        }));

        res.json({ balances, plan: readablePlan });
    } catch (err) {
        console.error("Balance calc error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const userId = req.user.id;

        const expense = await Expense.findById(expenseId);
        if (!expense) return res.status(404).json({ error: "Expense not found" });

        // Authorization: Only payer or group creator can delete? For now, only payer.
        // Assuming paidBy is ObjectId
        if (expense.paidBy.toString() !== userId) {
            return res.status(403).json({ error: "Only the payer can delete this expense" });
        }

        await Expense.findByIdAndDelete(expenseId);
        res.json({ message: "Expense deleted" });

    } catch (err) {
        console.error("Delete expense error", err);
        res.status(500).json({ error: "Server error" });
    }
};
